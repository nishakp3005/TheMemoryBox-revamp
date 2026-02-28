export type Product = {
  id: number;
  name: string;
  description: string;
  tags: string[];
  /** Image URL for the product */
  image: string;
  /** Price in USD (decimal) */
  price: number;
  /** Discount percent (0-100) */
  discount: number;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Aurora Headphones",
    description: "Wireless noise-cancelling headphones with 30h battery life.",
    tags: ["audio", "wireless", "noise-cancelling"],
    image: "https://via.placeholder.com/640x360?text=Aurora+Headphones",
    price: 199.99,
    discount: 15,
  },
  {
    id: 2,
    name: "Lumen Desk Lamp",
    description:
      "Adjustable LED desk lamp with warm/cool modes and USB-C charging.",
    tags: ["home", "lighting", "desk"],
    image: "https://via.placeholder.com/640x360?text=Lumen+Desk+Lamp",
    price: 49.5,
    discount: 0,
  },
  {
    id: 3,
    name: "Nimbus Backpack",
    description:
      'Water-resistant backpack with padded laptop compartment (15\").',
    tags: ["travel", "bags", "laptop"],
    image: "https://via.placeholder.com/640x360?text=Nimbus+Backpack",
    price: 79.0,
    discount: 10,
  },
  {
    id: 4,
    name: "Quartz Smartwatch",
    description: "Fitness-focused smartwatch with heart-rate and GPS tracking.",
    tags: ["wearable", "fitness", "smartwatch"],
    image: "https://via.placeholder.com/640x360?text=Quartz+Smartwatch",
    price: 149.99,
    discount: 20,
  },
  {
    id: 5,
    name: "Slate Bluetooth Speaker",
    description: "Portable Bluetooth speaker with rich bass and IPX6 rating.",
    tags: ["audio", "portable", "outdoor"],
    image: "https://via.placeholder.com/640x360?text=Slate+Speaker",
    price: 59.99,
    discount: 5,
  },
  {
    id: 6,
    name: "Orbit Wireless Mouse",
    description:
      "Ergonomic wireless mouse with programmable buttons and long battery life.",
    tags: ["accessories", "mouse", "wireless"],
    image: "https://via.placeholder.com/640x360?text=Orbit+Mouse",
    price: 29.99,
    discount: 0,
  },
  {
    id: 7,
    name: "Velvet Notebook",
    description: "Hardcover notebook with numbered pages and elastic closure.",
    tags: ["stationery", "notebook"],
    image: "https://via.placeholder.com/640x360?text=Velvet+Notebook",
    price: 14.25,
    discount: 0,
  },
  {
    id: 8,
    name: "Cascade Water Bottle",
    description:
      "Insulated stainless steel bottle keeps drinks cold for 24 hours.",
    tags: ["drinkware", "outdoor"],
    image: "https://via.placeholder.com/640x360?text=Cascade+Water+Bottle",
    price: 24.0,
    discount: 12,
  },
  {
    id: 9,
    name: "Pixel Sketch Pad",
    description: "High-quality sketch pad paper for markers and pencil work.",
    tags: ["art", "paper"],
    image: "https://via.placeholder.com/640x360?text=Pixel+Sketch+Pad",
    price: 12.5,
    discount: 0,
  },
];

export default products;
