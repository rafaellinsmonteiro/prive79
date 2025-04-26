
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const FilterSection = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center p-6 bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
        <Input
          placeholder="Buscar modelo..."
          className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-pink-500/50"
        />
      </div>
      <Select>
        <SelectTrigger className="w-full sm:w-[180px] bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:ring-pink-500/50">
          <SelectValue placeholder="Localização" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          <SelectItem value="sp" className="text-zinc-100 focus:bg-zinc-800">São Paulo</SelectItem>
          <SelectItem value="rj" className="text-zinc-100 focus:bg-zinc-800">Rio de Janeiro</SelectItem>
          <SelectItem value="mg" className="text-zinc-100 focus:bg-zinc-800">Minas Gerais</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSection;
