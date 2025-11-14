import asyncio
import logging
from services.node_api_service import node_api_service
from services.llm_service import generate_agent_decision

logger = logging.getLogger(__name__)

def format_portfolio(portfolio: list) -> str:
    """Helper function to format the agent's portfolio for the prompt."""
    if not portfolio:
        return "You currently hold no stocks."
    
    holdings = [f"{item['quantity']} shares of {item['stock']['symbol']} (Avg. Buy Price: ${item.get('averageBuyPrice', 0):.2f})" for item in portfolio]
    return "Your current holdings are: " + ", ".join(holdings) + "."

async def process_single_agent(
    agent: dict, 
    market_context: str, 
    event_string: str, 
    event_id: str | None = None  
):
    """Processes a single agent's decision cycle based on a market event."""
    try:
        agent_id = agent['_id']
        agent_details = await node_api_service.get_agent_details(agent_id)
        if not agent_details or 'agent' not in agent_details:
            logger.warning(f"Could not get valid details for agent {agent_id}. Skipping.")
            return

        agent_data = agent_details['agent']

        agent_model = agent_data.get('model', 'gemini-2.5-pro')

        balance = agent_data.get('balance', 0)
        portfolio_value = 0
        if agent_data.get('portfolio'):
            for item in agent_data['portfolio']:
                if item.get('stock') and isinstance(item['stock'], dict) and item['stock'].get('price') is not None:
                    portfolio_value += item.get('quantity', 0) * item['stock']['price']
                
        net_worth = balance + portfolio_value

        prompt = f"""
You are a trading agent named '{agent_data.get('name', 'N/A')}'.
Your Persona: '{agent_data.get('persona', 'N/A')}'.
Your AI Model: '{agent_model}'

Your Financial Status:
- Cash Balance: ${balance:.2f}
- Portfolio Value: ${portfolio_value:.2f}
- Total Net Worth: ${net_worth:.2f}
- {format_portfolio(agent_data.get('portfolio', []))}

{market_context}

Market Event:
{event_string}

Task:
Based on your persona, your current holdings, your cash balance, and the provided market data and event, decide whether to BUY, SELL, or HOLD.
- If you BUY, choose a stock from the list and specify a quantity you can afford.
- If you SELL, choose a stock from your portfolio and specify a quantity you own.
- If you HOLD, you take no action.
- Be rational. Your goal is to maximize your net worth.
"""
        decision = await generate_agent_decision(prompt, agent_model)
        
        if not decision:
            logger.error(f"Failed to get a decision for agent {agent_id}")
            return

        log_payload = {
            "agentId": agent_id,
            "insight": decision.get('reasoning', 'No reasoning provided.'),
            "actionsTaken": f"Decision: {decision.get('decision')}, Symbol: {decision.get('symbol')}, Quantity: {decision.get('quantity')}",
            "marketSentiment": decision.get('emotion', 'Neutral'),
            "netWorthSnapshot": net_worth,
            "newsEvent": event_id 
        }
        await node_api_service.agent_action("log", log_payload)

        action = decision.get("decision", "HOLD").upper()
        if action in ["BUY", "SELL"]:
            trade_payload = {
                "agentId": agent_id,
                "symbol": decision.get("symbol"),
                "quantity": decision.get("quantity", 0)
            }
            try:
                trade_quantity = float(trade_payload["quantity"])
                if trade_payload["symbol"] and trade_quantity > 0:
                    trade_payload["quantity"] = trade_quantity
                    await node_api_service.agent_action(action.lower(), trade_payload)
                else:
                    logger.warning(f"Agent {agent_id} decided to {action} but provided invalid symbol or quantity. Skipping trade.")
            except (ValueError, TypeError):
                 logger.warning(f"Agent {agent_id} provided non-numeric quantity: {trade_payload['quantity']}. Skipping trade.")

    except Exception as e:
        logger.error(f"Error processing agent {agent.get('name', 'Unknown')}: {e}", exc_info=True)


async def trigger_all_agents_with_news(news_string: str, event_id: str): 
    """
    Triggers all agents to react to a specific news event.
    """
    logger.info(f"--- Triggering all agents for news event_id: {event_id} ---")
    event_string = f"A news event has just occurred: \"{news_string}\""
    await _trigger_all_agents(event_string, event_id) 
    
async def trigger_daily_market_review():
    """
    Triggers all agents to perform their routine daily market analysis.
    """
    logger.info("--- Triggering daily market review for all agents ---")
    event_string = "The market is open for trading. Review your portfolio and the current market prices to make a decision."
    await _trigger_all_agents(event_string, event_id=None) 


async def _trigger_all_agents(event_string: str, event_id: str | None = None): 
    """
    Generic internal function to fetch market data and trigger agents
    based on a given event string.
    """
    all_stocks = await node_api_service.get_all_stocks()
    if not all_stocks:
        logger.error("Could not fetch stock data. Aborting agent trigger.")
        return
        
    market_context_parts = ["Current Market Prices:"]
    for stock in all_stocks:
        market_context_parts.append(f"- {stock['symbol']}: ${stock.get('price', 0):.2f}")
    market_context = "\n".join(market_context_parts)

    agents = await node_api_service.get_all_agents()
    if not agents:
        logger.warning("No agents found to trigger.")
        return

    tasks = [process_single_agent(agent, market_context, event_string, event_id) for agent in agents]
    await asyncio.gather(*tasks)
    
    logger.info(f"--- All agents have been processed for event: {event_string[:50]}... ---")