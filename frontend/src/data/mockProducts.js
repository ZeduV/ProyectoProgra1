import runningTshirt from '../assets/products/running_tshirt.png';
import trainingShorts from '../assets/products/training_shorts.png';
import sportHoodie from '../assets/products/sport_hoodie.png';
import footballBall from '../assets/products/football_ball.png';
import basketballBall from '../assets/products/basketball_ball.png';
import volleyballBall from '../assets/products/volleyball_ball.png';
import runningShoes from '../assets/products/running_shoes.png';
import footballBoots from '../assets/products/football_boots.png';
import trainingShoes from '../assets/products/training_shoes.png';

const mockProducts = [
  // ROPA
  {
    id: 1,
    name: 'Camiseta Running Pro',
    category: 'Ropa',
    price: 149.99,
    image: runningTshirt,
    description: 'Camiseta técnica de alto rendimiento con tecnología de secado rápido.',
  },
  {
    id: 2,
    name: 'Shorts Entrenamiento',
    category: 'Ropa',
    price: 109.99,
    image: trainingShorts,
    description: 'Shorts ligeros y transpirables ideales para sesiones intensas.',
  },
  {
    id: 3,
    name: 'Sudadera Deportiva',
    category: 'Ropa',
    price: 199.99,
    image: sportHoodie,
    description: 'Sudadera con capucha de felpa premium para antes y después del entreno.',
  },
  // BALONES
  {
    id: 4,
    name: 'Balón Fútbol Pro',
    category: 'Balones',
    price: 129.99,
    image: footballBall,
    description: 'Balón de fútbol de competición con cosido térmico de alta precisión.',
  },
  {
    id: 5,
    name: 'Balón Basketball',
    category: 'Balones',
    price: 169.99,
    image: basketballBall,
    description: 'Balón de basketball profesional con agarre superior de cuero sintético.',
  },
  {
    id: 6,
    name: 'Balón Voleibol',
    category: 'Balones',
    price: 119.99,
    image: volleyballBall,
    description: 'Balón de voleibol oficial con panel suave al tacto para interior y exterior.',
  },
  // ZAPATOS
  {
    id: 7,
    name: 'Zapatillas Running',
    category: 'Zapatos',
    price: 389.99,
    image: runningShoes,
    description: 'Zapatillas con amortiguación reactiva y suela de carbono ultraligera.',
  },
  {
    id: 8,
    name: 'Botas Fútbol',
    category: 'Zapatos',
    price: 329.99,
    image: footballBoots,
    description: 'Botas de fútbol con tacos moldeados para tracción en césped natural.',
  },
  {
    id: 9,
    name: 'Zapatillas Training',
    category: 'Zapatos',
    price: 299.99,
    image: trainingShoes,
    description: 'Zapatillas de entrenamiento versátiles con soporte lateral reforzado.',
  },
];

export default mockProducts;

export const categories = ['Todos', 'Ropa', 'Balones', 'Zapatos'];
