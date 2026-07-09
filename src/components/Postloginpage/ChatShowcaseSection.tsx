import Image from "next/image";

export default function ChatShowcaseSection() {
  return (
    <section className="w-full flex justify-center py-8 px-2 bg-[#f6f6f8]">
      <div className="relative bg-white rounded-2xl shadow w-full max-w-[1240px] h-[562px] flex flex-col items-center justify-center overflow-hidden">
        <div className="flex justify-center items-end gap-4 md:gap-8 mt-[57px] relative w-full h-full">
          {/* Left Image */}
          <div className="relative z-10 h-full flex items-end">
            <Image
              src="/homePage/chat1.png"
              alt="Chat Left"
              width={352}
              height={706}
              className="w-[120px] h-[240px] md:w-[220px] md:h-[441px] lg:w-[352px] lg:h-[706px] object-cover rounded-xl shadow-lg"
              style={{maxHeight: '100%'}} // Ensures image doesn't overflow
              priority
            />
          </div>
          {/* Middle Image */}
          <div className="relative z-20 flex flex-col items-center h-full justify-end">
            <Image
              src="/homePage/chat2.png"
              alt="Chat Center"
              width={352}
              height={706}
              className="w-[140px] h-[260px] md:w-[250px] md:h-[500px] lg:w-[352px] lg:h-[706px] object-cover rounded-xl shadow-2xl"
              style={{maxHeight: '100%'}} // Ensures image doesn't overflow
              priority
            />
            {/* Overlay Button */}
            <button className="absolute left-1/2 -translate-x-1/2 bottom-0 mb-4 w-[180px] h-[48px] md:w-[320px] md:h-[56px] lg:w-[441px] lg:h-[68px] bg-gradient-to-r from-[#5b5be7] to-[#b14be4] text-white text-[16px] md:text-[20px] font-semibold rounded-full shadow-lg flex items-center justify-center">
              Connect Now
            </button>
          </div>
          {/* Right Image */}
          <div className="relative z-10 h-full flex items-end">
            <Image
              src="/homePage/chat3.png" 
              alt="Chat Right"
              width={352}
              height={706}
              className="w-[120px] h-[240px] md:w-[220px] md:h-[441px] lg:w-[352px] lg:h-[706px] object-cover rounded-xl shadow-lg"
              style={{maxHeight: '100%'}} // Ensures image doesn't overflow
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
} 