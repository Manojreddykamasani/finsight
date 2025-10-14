import asyncio
import logging
from services.node_api_service import node_api_service
from services.gemini_service import generate_agent_decision

logger = logging.getLogger(__name__)

def format_portfolio(portfolio: list) -> str:
    """Helper function to format the agent's portfolio for the prompt."""
    if not portfolio:
        return "You currently hold no stocks."
    
    holdings = [f"{item['quantity']} shares of {item['stock']['symbol']} (Avg. Buy Price: ${item.get('averageBuyPrice', 0):.2f})" for item in portfolio]
    return "Your current holdings are: " + ", ".join(holdings) + "."

async def process_single_agent(agent: dict, market_context: str, event_string: str):
    """Processes a single agent's decision cycle based on a market event."""
    try:
        agent_id = agent['_id']
        agent_details = await node_api_service.get_agent_details(agent_id)
        if not agent_details or 'agent' not in agent_details:
            logger.warning(f"Could not get valid details for agent {agent_id}. Skipping.")
            return

        agent_data = agent_details['agent']

        # Construct the detailed, context-rich prompt
        prompt = f"""
You are a trading agent named '{agent_data.get('name', 'N/A')}'.
Your Persona: '{agent_data.get('persona', 'N/A')}'.

Your Financial Status:
- Cash Balance: ${agent_data.get('balance', 0):.2f}
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

        decision = await generate_agent_decision(prompt)
        
        if not decision:
            logger.error(f"Failed to get a decision for agent {agent_id}")
            return

        # Log the agent's insight and decision
        net_worth = agent_data.get('netWorth', agent_data.get('balance', 0))
        log_payload = {
            "agentId": agent_id,
            "insight": decision.get('reasoning', 'No reasoning provided.'),
            "actionsTaken": f"Decision: {decision.get('decision')}, Symbol: {decision.get('symbol')}, Quantity: {decision.get('quantity')}",
            "marketSentiment": decision.get('emotion', 'Neutral'),
            "netWorthSnapshot": net_worth
        }
        await node_api_service.agent_action("log", log_payload)

        # Execute the trade if the decision is to BUY or SELL
        action = decision.get("decision", "HOLD").upper()
        if action in ["BUY", "SELL"]:
            trade_payload = {
                "agentId": agent_id,
                "symbol": decision.get("symbol"),
                "quantity": decision.get("quantity", 0)
            }
            if trade_payload["symbol"] and trade_payload.get("quantity", 0) > 0:
                await node_api_service.agent_action(action.lower(), trade_payload)
            else:
                 logger.warning(f"Agent {agent_id} decided to {action} but provided invalid symbol or quantity. Skipping trade.")


    except Exception as e:
        logger.error(f"Error processing agent {agent.get('name', 'Unknown')}: {e}", exc_info=True)


async def trigger_all_agents_with_news(news_string: str):
    """
    Triggers all agents to react to a specific news event.
    """
    logger.info("--- Triggering all agents with news ---")
    event_string = f"A news event has just occurred: \"{news_string}\""
    await _trigger_all_agents(event_string)
    
async def trigger_daily_market_review():
    """
    Triggers all agents to perform their routine daily market analysis.
    This is the missing function that the scheduler needs.
    """
    logger.info("--- Triggering daily market review for all agents ---")
    event_string = "The market is open for trading. Review your portfolio and the current market prices to make a decision."
    await _trigger_all_agents(event_string)


async def _trigger_all_agents(event_string: str):
    """
    Generic internal function to fetch market data and trigger agents
    based on a given event string.
    """
    # 1. Fetch current market data (all stocks and prices)
    all_stocks = await node_api_service.get_all_stocks()
    if not all_stocks:
        logger.error("Could not fetch stock data. Aborting agent trigger.")
        return
        
    # 2. Format the market data into a string for the prompt
    market_context_parts = ["Current Market Prices:"]
    for stock in all_stocks:
        market_context_parts.append(f"- {stock['symbol']}: ${stock.get('price', 0):.2f}")
    market_context = "\n".join(market_context_parts)

    # 3. Fetch all agents
    agents = await node_api_service.get_all_agents()
    if not agents:
        logger.warning("No agents found to trigger.")
        return

    # 4. Create and run tasks for all agents concurrently
    tasks = [process_single_agent(agent, market_context, event_string) for agent in agents]
    await asyncio.gather(*tasks)
    
    logger.info(f"--- All agents have been processed for event: {event_string[:50]}... ---")

