const request = require("request");

const editProductTitle = (shop, access_token) => {
  if (access_token == false || access_token.length == 0) {
    console.log(
      `${new Date().toString()}] Access Token is empty, skip cron job.`
    );
    return;
  }

  console.log(
    `[${new Date().toString()}] Start products title update process...`
  );
  const getOptions = {
    url: `https://${shop}/admin/products.json`,
    headers: {
      "X-Shopify-Access-Token": access_token,
    },
    json: true,
  };

  request(getOptions, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    ChangeValue(body);
  });

  const ChangeValue = (data) => {
    data.products.forEach((product) => {
      const splitTitle = product.title.split("|");
      const newTitle =
        splitTitle.length > 1 ? splitTitle[1].trim() : product.title;
      const lotTitle =
        "Lot: " + Math.round(Math.random() * 100 + 1) + " | " + newTitle;
      product.title = lotTitle;
      const id = product.id;
      const options = {
        url: `https://${shop}/admin/products/${id}.json`,
        json: true,
        headers: {
          "X-Shopify-Access-Token": access_token,
        },
        body: {
          product,
        },
      };

      request.put(options, (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        console.log(
          `[${new Date().toString()}] Update Title "${body.product.title} (${
            body.product.id
          })"`
        );
      });
    });
  };
};

export default editProductTitle;
