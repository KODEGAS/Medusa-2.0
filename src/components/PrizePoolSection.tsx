import { useState, useEffect } from "react";
import { Trophy, Medal, Award } from "lucide-react";

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
      position: "1st",
      amount: 70000,
      icon: Trophy,
      color: "from-yellow-400 to-yellow-600",
      glow: "shadow-yellow-500/50",
      height: "h-48",
      delay: "delay-100"
    },
    {
      position: "2nd",
      amount: 50000,
      icon: Medal,
      color: "from-gray-300 to-gray-500",
      glow: "shadow-gray-400/50",
      height: "h-36",
      delay: "delay-200"
    },
    {
      position: "3rd",
      amount: 40000,
      icon: Award,
      color: "from-orange-400 to-orange-600",
      glow: "shadow-orange-500/50",
      height: "h-28",
      delay: "delay-300"
    }
  ];

  return (
    <section id="prize-pool" className="py-20 px-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(34,197,94,0.1)_25%,rgba(34,197,94,0.1)_26%,transparent_27%,transparent_74%,rgba(34,197,94,0.1)_75%,rgba(34,197,94,0.1)_76%,transparent_77%),linear-gradient(rgba(34,197,94,0.1)_24%,transparent_25%,transparent_26%,rgba(34,197,94,0.1)_27%,rgba(34,197,94,0.1)_74%,transparent_75%,transparent_76%,rgba(34,197,94,0.1)_77%)] bg-[size:75px_75px]"></div>
      </div>

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

        {/* 3D Podium */}
        <div className="flex items-end justify-center gap-8 mb-16 perspective-1000">
          {prizes.map((prize, index) => {
            const IconComponent = prize.icon;
            return (
              <div
                key={prize.position}
                className={`relative group ${prize.delay} ${animateNumbers ? 'animate-scale-in' : 'opacity-0'}`}
              >
                {/* Podium Base */}
                <div
                  className={`${prize.height} w-32 bg-gradient-to-t ${prize.color} rounded-t-lg relative transform-gpu transition-all duration-500 group-hover:scale-105 shadow-2xl ${prize.glow}`}
                  style={{
                    background: `linear-gradient(145deg, ${prize.color.split(' ')[1]}, ${prize.color.split(' ')[3]})`
                  }}
                >
                  {/* Glowing edges */}
                  <div className="absolute inset-0 rounded-t-lg border-2 border-cyber-green/30 group-hover:border-cyber-green/60 transition-colors duration-300"></div>

                  {/* Position number */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-background">
                    {prize.position}
                  </div>

                  {/* Prize amount */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-lg font-mono font-bold text-background">
                      LKR <AnimatedNumber target={prize.amount} />
                    </div>
                  </div>
                </div>

                {/* Floating Icon */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyber-green to-primary flex items-center justify-center shadow-lg shadow-cyber-green/50 group-hover:shadow-cyber-green/80 transition-shadow duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Particle effects */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-cyber-green rounded-full animate-ping"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${10 + (i % 2) * 30}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            );
          })}
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