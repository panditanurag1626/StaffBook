import { Search } from "lucide-react";
import Button from "./Button";

const SearchButton = () => {
  return (
    <div className="w-full flex justify-center items-center">
      <Button
        className="w-[17rem] sm:w-[15.25rem] h-[3.75rem] sm:h-[3.25rem] bg-gradient-to-r from-[#FF8000] to-[#C84D13] text-white rounded-[3.25rem] text-base sm:text-[0.875rem] font-semibold shadow-md hover:scale-105 transition border-none hover:opacity-90"
      >
        <Search className="w-5 h-5 mr-2" />
        Search
      </Button>
    </div>
  );
};

export default SearchButton;
