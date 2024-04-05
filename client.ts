
// This is a simple client that sends a create restaurant command and a change restaurant menu command to the server


// Create a restaurant command JSON
const createRestaurantCommandJson = `
{
    "commandId": "691490bb-c4d3-45b8-99d0-efcf20e353ag",
    "decider": "Restaurant",
    "kind": "CreateRestaurantCommand",
    "id": "691490bb-c4d3-45b8-99d0-efcf20e353ao",
    "name": "Eat at Joes",
    "menu": {
      "menuItems": [
        {"menuItemId": "1", "name": "Salad", "price": "8.99"},
        {"menuItemId": "2", "name": "Soup", "price": "6.99"},
        {"menuItemId": "3", "name": "Steak", "price": "19.99"}
      ],
      "menuId": "34110e19-ca72-45e7-b969-61bebf54da08",
      "cuisine": "SERBIAN"
    }
}
`;

// Change restaurant menu command JSON
const changeRestaurantMenuCommandJson = `
{
    "commandId": "691490bb-c4d3-45b8-99d0-efcf20e353ag",
    "decider": "Restaurant",
    "kind": "ChangeRestaurantMenuCommand",
    "id": "691490bb-c4d3-45b8-99d0-efcf20e353ao",
    "menu": {
      "menuItems": [
        {"menuItemId": "1", "name": "Salad", "price": "8.99"},
        {"menuItemId": "2", "name": "Soup", "price": "6.99"},
        {"menuItemId": "3", "name": "Steak", "price": "19.99"}
      ],
      "menuId": "34110e19-ca72-45e7-b969-61bebf54da08",
      "cuisine": "SERBIAN"
    }
}
`;

// Send the create restaurant command to the server
const createRestaurantCommandResult = await fetch("http://localhost:8000", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: createRestaurantCommandJson,
});

console.log(createRestaurantCommandResult);

// Send the change restaurant menu command to the server
const changeRestaurantMenuCommandResult = await fetch("http://localhost:8000", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: changeRestaurantMenuCommandJson,
});

console.log(changeRestaurantMenuCommandResult);


// Run the client : `deno run --allow-net client.ts`