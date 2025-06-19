
interface ReelsMediaStatsProps {
  total: number;
  featured: number;
  available: number;
}

const ReelsMediaStats = ({ total, featured, available }: ReelsMediaStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-zinc-800 p-4 rounded-lg">
        <div className="text-2xl font-bold text-white">
          {total}
        </div>
        <div className="text-zinc-400 text-sm">Total de Vídeos</div>
      </div>
      <div className="bg-zinc-800 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-400">
          {featured}
        </div>
        <div className="text-zinc-400 text-sm">Nos Reels</div>
      </div>
      <div className="bg-zinc-800 p-4 rounded-lg">
        <div className="text-2xl font-bold text-zinc-400">
          {available}
        </div>
        <div className="text-zinc-400 text-sm">Disponíveis</div>
      </div>
    </div>
  );
};

export default ReelsMediaStats;
