const Product = require('../models/product');

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ price: { $gt: 30 } })
    .sort('price')
    .select('name price');

  res.status(200).json({ products, nbHits: products.length });
};
const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};
  // get products if i pass featured in query whatever if i pass with it '{{URL}}/products?featured=true&page=2' page not found but will return products that featured = true
  if (featured) {
    queryObject.featured = featured === 'true' ? true : false;
  }
  //get products that company = ....
  if (company) {
    queryObject.company = company;
  }
  //get products that name = ....
  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }
  //get products using condion number .. like 'http://localhost:3000/api/v1/products?numericFilters=price>50'
  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ['price', 'rating'];
    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-');
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  let result = Product.find(queryObject);
  // sort
  if (sort) {
    const sortList = sort.split(',').join(' ');
    result = result.sort(sortList);
  } else {
    result = result.sort('createdAt');
  }
  //get products with field that i want .. like 'price,company => http://localhost:3000/api/v1/products?fields=name,company'
  if (fields) {
    const fieldsList = fields.split(',').join(' ');
    result = result.select(fieldsList);
  }
  const page = Number(req.query.page) || 1;
  //get limit number of products  = ....
  const limit = Number(req.query.limit) || 10; //get 10 products
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  // 23
  // 4 7 7 7 2

  const products = await result;
  res.status(200).json({ products, nbHits: products.length });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
};
