import axios from "axios";
import faker from "faker";

const editProductTitle = async (access) => {
  const endpoint = `https://myglovesstore.myshopify.com/admin/products/6773895463118.json?access_token=${access}`;
  const title = {
    product: {
      id: 6773895463118,
      title: `${faker.commerce.productName()}`,
    },
  };
  await axios.put(endpoint, title);
};

export default editProductTitle;
