
import FilterSection from "@/components/FilterSection";
import ModelCard from "@/components/ModelCard";

const models = [
  {
    id: 1,
    name: "Ana Silva",
    image: "/lovable-uploads/9fdf1d69-91eb-4c5c-8d25-8afe571e7479.png",
  },
  {
    id: 2,
    name: "Beatriz Costa",
    image: "/lovable-uploads/9fdf1d69-91eb-4c5c-8d25-8afe571e7479.png",
  },
  {
    id: 3,
    name: "Carolina Santos",
    image: "/lovable-uploads/9fdf1d69-91eb-4c5c-8d25-8afe571e7479.png",
  },
  {
    id: 4,
    name: "Diana Lima",
    image: "/lovable-uploads/9fdf1d69-91eb-4c5c-8d25-8afe571e7479.png",
  },
  {
    id: 5,
    name: "Elena Martins",
    image: "/lovable-uploads/9fdf1d69-91eb-4c5c-8d25-8afe571e7479.png",
  },
  {
    id: 6,
    name: "Fernanda Oliveira",
    image: "/lovable-uploads/9fdf1d69-91eb-4c5c-8d25-8afe571e7479.png",
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Modelos Exclusivas</h1>
          <FilterSection />
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              name={model.name}
              image={model.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
