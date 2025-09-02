import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-128px)] p-6 md:p-12 space-y-8 md:space-y-0 md:space-x-12">
      {/* Text Content */}
      <div className="flex flex-col items-start space-y-6 max-w-lg text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
            Finsight
          </span>
          : Your AI Stock Market Agent
        </h1>
        <p className="text-lg md:text-xl text-primary-color leading-relaxed">
          Gain a competitive edge with our AI-powered insights. Finsight predicts market trends, analyzes complex data, and provides actionable intelligence to help you make smarter investment decisions.
        </p>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/signup" className="w-full sm:w-auto px-6 py-3 rounded-full text-white font-semibold shadow-lg transition-all transform hover:scale-105 duration-300 ease-in-out bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Get Started Free
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold shadow-md transition-all transform hover:scale-105 duration-300 ease-in-out border border-primary-color text-primary-color hover:bg-primary-color hover:text-white">
            Log In
          </Link>
        </div>
      </div>

      {/* Hero Image or Animation */}
      <div className="relative w-full max-w-md h-auto md:h-96 transform rotate-3 scale-95 transition-transform duration-500 ease-in-out">
        <Image 
          src="https://placehold.co/600x400/2d3748/a0aec0?text=AI+Analytics" 
          alt="AI Analytics" 
          width={600}
          height={400}
          className="rounded-xl shadow-2xl transform -rotate-3 transition-transform duration-500 hover:rotate-0"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-500/20 to-green-500/20 rounded-xl"></div>
      </div>
    </div>
  );
};
export default Hero;