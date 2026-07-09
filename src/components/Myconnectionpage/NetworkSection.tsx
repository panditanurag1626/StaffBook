import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function NetworkSection() {
  return (
    <section className="w-full max-w-[600px] mt-4 mb-4">
      {/* Title */}
      <h2 className="text-lg font-semibold text-black mb-4">Grow your network</h2>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex items-center p-4">
          {/* Left Content */}
          <div className="bg-gradient-to-r from-teal-500 to-green-400 rounded-xl p-5 flex items-center justify-between">
  {/* Left Content */}
  <div className="flex-1">
    <div className="flex items-center mb-2">
      <Image
        src="/logo.png"
        alt="naukri logo"
        width={28}
        height={28}
      />
      <span className="ml-2 font-bold text-white text-lg">Staffbook </span>
    </div>
    <p className="text-sm text-white mb-3 max-w-xs">
      Powerful tools & tips that help you prepare for every stage of your career
    </p>
    <button className="flex items-center bg-white text-blue-700 text-sm font-semibold rounded-full px-5 py-2 shadow-md hover:bg-gray-100">
      ▶ Play
    </button>
  </div>

  {/* Right Image */}
  <div className="w-28 h-28 relative">
    <Image
      src="/images/person.png"
      alt="person"
      fill
      className="object-cover rounded-lg"
    />
  </div>
</div>


          {/* Right Image */}
          <div className="w-32 h-32 relative">
            <Image
              src="/images/google-logo.png"
              alt="person"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="flex items-center justify-between bg-[#f8f8f8] px-4 py-3 border-t">
          <div className="flex items-center gap-2">
            <Image
              src="/homePage/google-logo.png"
              alt="mini logo"
              width={24}
              height={24}
            />
            <div>
              <p className="text-sm font-semibold text-black truncate w-48">
                Microsoft Reportedly Pauses Development On ...
              </p>
              <p className="text-xs text-gray-500">
                Microsoft has reportedly paused the development of its ...
              </p>
            </div>
          </div>
          <ArrowRight className="text-gray-500" />
        </div>
      </div>
    </section>
  );
}
