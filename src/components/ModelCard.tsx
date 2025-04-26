
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ModelCardProps {
  name: string;
  image: string;
}

const ModelCard = ({ name, image }: ModelCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:scale-[1.02] cursor-pointer border-zinc-800/50 bg-zinc-900/50">
      <AspectRatio ratio={3/4}>
        <img 
          src={image} 
          alt={name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </AspectRatio>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-xl font-medium">{name}</h3>
        </div>
      </div>
    </Card>
  );
};

export default ModelCard;
