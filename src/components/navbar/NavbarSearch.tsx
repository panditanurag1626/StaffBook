import { useState, useEffect, useRef } from "react";
import { FiSearch, FiLoader, FiBriefcase, FiUser, FiFileText } from "react-icons/fi";
import apiClient from "@/lib/api/config";
import Link from "next/link";
import Image from "next/image";

type SearchTabKey = "connections" | "jobs" | "posts";

interface SearchTab {
  key: SearchTabKey;
  total: number;
  page: number;
  per_page: number;
  data: any[];
}

interface SearchResponseData {
  query: string;
  tab: string;
  tabs: SearchTab[];
}

interface SearchResponse {
  status: number;
  statusText: string;
  message: string;
  data: SearchResponseData;
}

interface NavbarSearchProps {
  className?: string;
  onClose?: () => void;
}

const NavbarSearch = ({ className, onClose }: NavbarSearchProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<SearchTab[] | null>(null);
  const [page, setPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // Reset page on new query
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        setDropdownOpen(false);
        return;
      }
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const response = await apiClient.get<SearchResponse>("/search/solo", {
          params: {
            q: debouncedQuery,
            tab: "all",
            page: page,
            per_page: 10,
          },
        });

        const tabs = response.data?.data?.tabs || [];

        if (page === 1) {
          setResults(tabs);
          setDropdownOpen(true);
        } else {
          // Append new data to existing tabs
          setResults((prev) => {
            if (!prev) return tabs;
            return prev.map((prevTab) => {
              const newTab = tabs.find((t) => t.key === prevTab.key);
              if (newTab) {
                return {
                  ...prevTab,
                  data: [...prevTab.data, ...newTab.data],
                  page: newTab.page,
                  total: newTab.total
                };
              }
              return prevTab;
            });
          });
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, page]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasMore = results?.some((tab) => tab.data.length < tab.total) || false;

  const handleShowMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleItemClick = () => {
    setDropdownOpen(false);
    setQuery("");
    if (onClose) onClose();
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="People, Post & Jobs"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.trim()) setDropdownOpen(true); }}
        className=" text-black block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[10px] leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all duration-300 hover:bg-white/60"
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <FiLoader className="h-4 w-4 text-gray-400 animate-spin" />
        </div>
      )}

      {/* DROPDOWN UI */}
      {dropdownOpen && (query.trim().length > 0) && (
        <div className="absolute z-50 top-full mt-2 w-full min-w-[320px] bg-white rounded-lg shadow-xl border border-gray-100 right-0 max-h-[70vh] overflow-y-auto hidden-scrollbar">
          <div className="p-3">
            {loading ? (
              <div className="text-sm text-gray-500 text-center py-6 flex flex-col items-center justify-center space-y-2">
                <FiLoader className="h-6 w-6 text-primary animate-spin" />
                <span>Searching...</span>
              </div>
            ) : results && results.some(tab => tab.data && tab.data.length > 0) ? (
              <div className="flex flex-col gap-4">

                {results.map((tab) => {
                  if (!tab.data || tab.data.length === 0) return null;

                  return (
                    <div key={tab.key} className="flex flex-col mb-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-gray-100 pb-1">
                        {tab.key === "jobs" && <FiBriefcase />}
                        {tab.key === "connections" && <FiUser />}
                        {tab.key === "posts" && <FiFileText />}
                        {tab.key} <span className="text-gray-300 ml-auto lowercase font-normal">{tab.total} found</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {tab.data.map((item, idx) => (
                          <div key={`${tab.key}-${item.id || idx}`} className="p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group">
                            {tab.key === "jobs" && (
                              <Link href={`/profile/jobs/${item.id}`} className="block" onClick={handleItemClick}>
                                <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">{item.job_title}</h4>
                                <p className="text-xs text-gray-500">{item.company_name} • {item.location || item.city}</p>
                              </Link>
                            )}
                            {tab.key === "connections" && (
                              <Link href={`/user/${item.id}`} className="flex items-center gap-3" onClick={handleItemClick}>
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                  <Image src={item.picture || item.image || "/assets/images/placeholder_user.png"} alt="User" width={32} height={32} className="object-cover h-full w-full" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">{item.first_name} {item.last_name}</h4>
                                  <p className="text-xs text-gray-500 line-clamp-1">{item.designation ?? item.profileHeadline}</p>
                                </div>
                              </Link>
                            )}
                            {tab.key === "posts" && (
                              <Link href={`/networking`} className="block" onClick={handleItemClick}>
                                <p
                                  className="text-sm text-gray-800 line-clamp-2 group-hover:text-primary transition-colors"
                                  dangerouslySetInnerHTML={{ __html: item.title }}
                                />
                                <p className="text-xs text-gray-400 mt-1">{item.human_readable}</p>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Show More Button */}
                {hasMore && (
                  <button
                    onClick={handleShowMore}
                    disabled={loadingMore}
                    className="mt-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-primary text-sm font-medium rounded-md transition-colors flex justify-center items-center gap-2 border border-gray-100"
                  >
                    {loadingMore ? (
                      <><FiLoader className="h-4 w-4 animate-spin" /> Loading more...</>
                    ) : (
                      "See more results"
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-6">No results found for "{query}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
