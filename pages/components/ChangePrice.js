import React, { useState } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Layout, Button, Banner, Toast, Stack, Frame } from '@shopify/polaris';
import { Context } from '@shopify/app-bridge-react';

// GraphQL mutation that updates the prices of products
const UPDATE_PRICE = gql`
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      product {
        title
      }
      productVariant {
        id
        price
      }
    }
  }
`;

const priceIsValid = (price) => {
  price = price.trim();
  return price.length > 0 && !price.endsWith('.')
};

class ChangePrice extends React.Component {
  static contextType = Context;

  render() {
    return ( // Uses mutation's input to update product prices
      <Mutation mutation={UPDATE_PRICE}>
        {(handleSubmit, {error, data}) => {
          const [hasResults, setHasResults] = useState(false);
          const { allItems } = this.props;
          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );

          const showToast = hasResults && (
            <Toast
              content="Successfully updated"
              onDismiss={() => setHasResults(false)}
            />
          );

          return (
            <Frame>
              {showToast}
              <Layout.Section>
                {showError}
              </Layout.Section>

              
                <Stack distribution={"center"} spacing="none">
                  <Stack.Item fill>
                    <Button
                      primary
                      fullWidth={true}
                      textAlign={"center"}
                      onClick={() => {
                        let promise = new Promise((resolve) => resolve());
                        Object.keys(allItems).forEach(function(key) {
                          var item = allItems[key];
                          const productVariableInput = {
                            id: item.node.variants.edges[0].node.id,
                            price: item.node.variants.edges[0].node.price,
                          };
                          if (priceIsValid(productVariableInput.price)) {
                            promise = promise.then(() => handleSubmit({ variables: { input: productVariableInput }}));
                          }
                        });
                        
                        if (promise) {
                          promise.then(() => this.props.onUpdate().then(() => setHasResults(true)));
                        }
                        alert("Your prices have been updated")
                        location.reload()}
                      }
                      >
                      Update prices
                    </Button>
                  </Stack.Item>
                </Stack>
              
            </Frame>
          );
        }}
      </Mutation>
    );
  }
}

export default ChangePrice;