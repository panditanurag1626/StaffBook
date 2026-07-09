'use client';

import Image from 'next/image';
import { Check, Briefcase, MessageCircle, UserPlus, MapPin, Users, Eye, Send, Video, Mail, Download, UserCheck, Search, Building2, Star, Layers, Megaphone } from 'lucide-react';
import { ServicePlan } from '../../types/service';
import Card from './Card';
import { THEME } from '@/styles/theme';

export default function ServiceCard({ title, features, price, originalPrice, image, popular = false, badgeText, badgeColor, onBuyNow }: ServicePlan & { originalPrice?: string | number, onBuyNow?: () => void }) {
  // Parse price to check for strikethrough format (e.g., "₹1000 Free")
  const priceMatch = price.match(/^₹(\d+)\s+(.+)$/);
  const hasStrikethrough = !!priceMatch || !!originalPrice;
  const strikethroughPrice = originalPrice ? `₹${originalPrice}` : (priceMatch ? `₹${priceMatch[1]}` : '');
  const actualPrice = originalPrice ? price : (priceMatch ? priceMatch[2] : price);

  // Function to parse feature and extract number if present
  const parseFeature = (feature: string) => {
    const match = feature.match(/^(.+?)\s*-\s*(.+)$/);
    if (match) {
      return { text: match[1].trim(), value: match[2].trim() };
    }
    return { text: feature, value: null };
  };

  // Function to get relevant icon based on feature text
  const getFeatureIcon = (featureText: string) => {
    const text = featureText.toLowerCase();

    if (text.includes('job posting') || text.includes('posting')) return Briefcase;
    if (text.includes('chat') || text.includes('live chat')) return MessageCircle;
    if (text.includes('connection') || text.includes('send unlimited')) return UserPlus;
    if (text.includes('nearby') || text.includes('searching')) return MapPin;
    if (text.includes('candidates')) return UserCheck;
    if (text.includes('contact') || text.includes('show contact')) return Eye;
    if (text.includes('invite') || text.includes('send invite')) return Send;
    if (text.includes('meet') || text.includes('conferencing') || text.includes('video')) return Video;
    if (text.includes('email')) return Mail;
    if (text.includes('download') || text.includes('cv') || text.includes('resume')) return Download;
    if (text.includes('network')) return Users;
    if (text.includes('search appears')) return Search;
    if (text.includes('employers')) return Building2;
    if (text.includes('portfolio')) return Briefcase;
    if (text.includes('premium')) return Star;
    if (text.includes('bulk')) return Layers;
    if (text.includes('banner')) return Megaphone;

    return Check; // Default fallback
  };

  return (
    <Card className="relative flex flex-col" hoverEffect noPadding>
      {/* Badge (Popular or Custom) */}
      {(popular || badgeText) && (
        <div
          className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-400 text-white text-xs font-bold px-4 py-1.5 rounded-full z-10 shadow-lg"
          style={badgeColor ? { background: badgeColor, backgroundImage: 'none' } : undefined}
        >
          {badgeText || 'Most Popular'}
        </div>
      )}

      {/* Image */}
      <div className="w-full h-[200px] bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover w-full h-full"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white leading-tight drop-shadow-lg">{title}</h3>
        </div>
      </div>

      <div className="p-6 flex flex-col">
        {/* Features */}
        <div className="space-y-2.5 mb-6">
          <div className="space-y-2.5 mb-6">
            {(() => {
              const renderedItems = [];
              let i = 0;

              while (i < features.length) {
                const featureStr = features[i];
                const { text, value } = parseFeature(featureStr);
                const FeatureIcon = getFeatureIcon(text);

                // Valid header criteria: No value AND followed by at least one item WITH a value
                let isHeader = false;
                if (!value && i + 1 < features.length) {
                  const nextFeature = parseFeature(features[i + 1]);
                  if (nextFeature.value) {
                    isHeader = true;
                  }
                }

                if (isHeader) {
                  // It's a header -> Render bordered box with sub-items
                  const subItems = [];
                  let j = i + 1;
                  while (j < features.length) {
                    const nextFeat = parseFeature(features[j]);
                    if (!nextFeat.value) break; // Stop if we hit another header or plain item without value (though usually header)
                    subItems.push({ ...nextFeat, originalIndex: j });
                    j++;
                  }

                  const isLaunchOffer = text.toLowerCase().includes('launch offer');

                  if (isLaunchOffer) {
                    renderedItems.push(
                      <div key={`group-${i}`} className="relative mt-3 rounded-xl p-[2px] bg-gradient-to-r from-[#bf953f] via-black to-[#bf953f]">
                        <div className="rounded-[10px] p-3 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 h-full">
                          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#bf953f] via-black to-[#bf953f]">
                            <FeatureIcon size={12} strokeWidth={2.5} className="text-[#bf953f]" />
                            {text}
                          </h4>

                          <div className="space-y-2">
                            {subItems.map((subItem) => {
                              const SubIcon = getFeatureIcon(subItem.text);
                              return (
                                <div key={subItem.originalIndex} className="flex items-center justify-between gap-3 group py-1.5 px-2 rounded-lg hover:bg-white/50 transition-all">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="p-1 rounded-full bg-yellow-100 text-[#bf953f] flex-shrink-0">
                                      <SubIcon size={14} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-sm text-gray-700 leading-relaxed">{subItem.text}</span>
                                  </div>
                                  <span className="text-sm font-bold text-[#bf953f] px-3 py-1 rounded-full whitespace-nowrap">
                                    {subItem.value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                    i = j;
                    continue;
                  }

                  renderedItems.push(
                    <div key={`group-${i}`} className="border-2 border-purple-200 rounded-xl p-3 bg-purple-50/30 mt-3">
                      <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <FeatureIcon size={12} strokeWidth={2.5} />
                        {text}
                      </h4>

                      <div className="space-y-2">
                        {subItems.map((subItem) => {
                          const SubIcon = getFeatureIcon(subItem.text);
                          return (
                            <div key={subItem.originalIndex} className="flex items-center justify-between gap-3 group py-1.5 px-2 rounded-lg hover:bg-white transition-all">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-1 rounded-full bg-purple-100 text-purple-600 flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                  <SubIcon size={14} strokeWidth={2.5} />
                                </div>
                                <span className="text-sm text-gray-700 leading-relaxed group-hover:text-purple-700 transition-colors">{subItem.text}</span>
                              </div>
                              <span className="text-sm font-bold text-purple-600 px-3 py-1 rounded-full whitespace-nowrap">
                                {subItem.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                  i = j;
                } else {
                  // It's a standalone item (either has a value, OR no value but not followed by items)
                  const isLastItem = i === features.length - 1;
                  renderedItems.push(
                    <div key={i} className={`flex items-center justify-between gap-3 group py-1.5 px-2 rounded-lg hover:bg-purple-50 transition-all ${!isLastItem ? 'border-b border-gray-200 pb-3' : ''}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-1 rounded-full bg-purple-100 text-purple-600 flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <FeatureIcon size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed group-hover:text-purple-700 transition-colors">{text}</span>
                      </div>
                      {value && (
                        <span className="text-sm font-bold text-purple-600 px-3 py-1 rounded-full whitespace-nowrap">
                          {value}
                        </span>
                      )}
                    </div>
                  );
                  i++;
                }
              }
              return renderedItems;
            })()}
          </div>
        </div>

        {/* Price Section */}
        <div className="pt-5 border-t-2 border-gray-100 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Subscription charges</p>

          {hasStrikethrough ? (
            <div className="mb-5">
              <p className="text-xl font-bold text-gray-400 line-through mb-1">{strikethroughPrice}</p>
              <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                {actualPrice}
              </p>
            </div>
          ) : (
            <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-5">
              {price}
            </p>
          )}

          {/* Buy Now Button - Centered */}
          <div className="flex justify-center">
            <button
              onClick={onBuyNow}
              className={`${THEME.components.button.primary} px-10 py-2.5 text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-2xl transform transition-all hover:scale-105 active:scale-95 rounded-full`}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Card>
  );
}