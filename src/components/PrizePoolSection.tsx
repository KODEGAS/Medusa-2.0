import { useState, useEffect } from "react";
import winnerImage from "@/assets/winner.webp";
import secondImage from "@/assets/second.webp";
import thirdImage from "@/assets/third.webp";
const PrizePoolSection = () => {
  const [animateNumbers, setAnimateNumbers] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimateNumbers(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('prize-pool');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const AnimatedNumber = ({ target, duration = 2000, prefix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      setCount(0); // Reset count when animation should start
    }, [animateNumbers]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (!animateNumbers) return;

      const increment = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [target, duration]);

    return <span>{prefix}{count.toLocaleString()}</span>;
  };

  const prizes = [
    {
      id: 2,
      position: "1ST RUNNER-UP",
      amount: 50000,
      image: secondImage,
      order: 1,
      highlight: false
    },
    {
      id: 1,
      position: "WINNING TEAM",
      amount: 70000,
      image: winnerImage,
      order: 2,
      highlight: true
    },
    {
      id: 3,
      position: "2ND RUNNER-UP",
      amount: 40000,
      image: thirdImage,
      order: 3,
      highlight: false
    }
  ];

  return (
    <section id="prize-pool" className="px-6 relative overflow-hidden">
     
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyber-green via-primary to-cyber-green bg-clip-text text-transparent mb-4">
            PRIZE POOL
          </h2>
          <div className="text-2xl md:text-3xl font-mono text-muted-foreground mb-8">
            Total Worth: LKR <AnimatedNumber target={160000} prefix="" />
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyber-green to-transparent mx-auto"></div>
        </div>

        {/* Three Trophy Images Layout */}
        <div className="flex justify-center items-end gap-6 md:gap-10 mb-16 px-4">
          {prizes
            .sort((a, b) => a.order - b.order)
            .map((prize, index) => (
              <div
                key={prize.id}
                className={`relative group ${
                  animateNumbers ? 'animate-scale-in opacity-100' : 'opacity-0'
                } transition-all duration-1000`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Trophy Image */}
                <div className="relative">
                  {/* Glow Background Effect */}
                  <div className={`absolute inset-0 rounded-full blur-3xl ${
                    prize.highlight 
                      ? 'bg-yellow-400/30 w-40 h-40 md:w-56 md:h-56' 
                      : prize.id === 2 
                        ? 'bg-green-800/50 w-32 h-32 md:w-48 md:h-48'
                        : 'bg-cyan-400/25 w-32 h-32 md:w-48 md:h-48'
                  } -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse`}></div>
                  
                  {/* Additional intense glow for winner */}
                  {prize.highlight && (
                    <div className="absolute inset-0 rounded-full blur-2xl bg-yellow-500/20 w-28 h-28 md:w-40 md:h-40 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
                  )}
                  
                  {/* Additional glow for second place */}
                  {prize.id === 2 && (
                    <div className="absolute inset-0 rounded-full blur-2xl bg-green-900/40 w-24 h-24 md:w-36 md:h-36 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
                  )}
                  
                  {/* Extra bright green glow for second place */}
                  {prize.id === 2 && (
                    <div className="absolute inset-0 rounded-full blur-xl bg-emerald-800/60 w-20 h-20 md:w-28 md:h-28 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
                  )}
                  
                  <img
                    src={prize.image}
                    alt={`Trophy ${prize.id}`}
                    className={`${
                      prize.highlight 
                        ? 'w-56 h-72 md:w-80 md:h-96' 
                        : 'w-48 h-64 md:w-72 md:h-88'
                    } object-contain mx-auto group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl relative z-10`}
                  />
                </div>

                

              </div>
            ))}
        </div>

        {/* Additional Prize Info */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: "Cash Prizes", desc: "Direct monetary rewards for top performers" },
            { title: "Certificates", desc: "Recognition certificates for all participants" },
            { title: "Networking", desc: "Connect with industry professionals" }
          ].map((item, index) => (
            <div
              key={index}
              className={`bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-6 text-center group hover:border-cyber-green/60 transition-all duration-300 ${animateNumbers ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${(index + 1) * 200}ms` }}
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-cyber-green transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrizePoolSection;