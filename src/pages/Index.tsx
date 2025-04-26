
import FilterSection from "@/components/FilterSection";
import ModelCard from "@/components/ModelCard";

const models = [
  {
    id: 1,
    name: "Ana Silva",
    image: "/lovable-uploads/57baecde-285f-4cbc-9e48-d743c2a3953c.png",
  },
  {
    id: 2,
    name: "Beatriz Costa",
    image: "/lovable-uploads/b9bd7d45-b917-4290-a1aa-bee5b931dc68.png",
  },
  {
    id: 3,
    name: "Carolina Santos",
    image: "/lovable-uploads/6e0363be-2338-4902-9942-2b48013527c7.png",
  },
  {
    id: 4,
    name: "Diana Lima",
    image: "/lovable-uploads/aa64fd07-f6e9-44dc-9884-31df43791242.png",
  },
  {
    id: 5,
    name: "Elena Martins",
    image: "/lovable-uploads/b79999d0-f8f1-48f6-aa79-16285eb7104d.png",
  },
  {
    id: 6,
    name: "Fernanda Oliveira",
    image: "/lovable-uploads/4fc5af21-d6b9-4ec2-8548-3712319ddf5e.png",
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Modelos Exclusivas</h1>
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
