import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const CategoryCard = ({ id, name, icon, description }: CategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/products?category=${id}`)}
      className="group bg-card hover:bg-leaf-lighter border border-border rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-card hover:scale-105 hover:border-primary/30"
    >
      <div className="w-16 h-16 bg-leaf-lighter group-hover:bg-primary/20 rounded-xl flex items-center justify-center text-3xl mb-4 transition-all duration-300">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
};

export default CategoryCard;
