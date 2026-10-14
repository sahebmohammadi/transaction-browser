# js-task

## Running the API server

```bash
npm install
npm run server
```

This starts `json-server` on `http://localhost:3001` using `data/db.json`.

## 📌 Testing the APIs

Test the APIs in your browser's URL bar like the examples below, so you can confirm everything works. That way, when you get to the coding part, you can be confident your requests are set up correctly.

👈🏻 **Searching:** If the user types the value `123` into the input, you need to define an `input` event. Then you send the request again based on the value below:

```js
const query = e.target.value // e.g. 123
...
axios.get(`http://localhost:3001/transactions?refId_like=${query}`)
```

👈🏻 **Sorting by price:**

```
http://localhost:3001/transactions?_sort=price&_order=desc
http://localhost:3001/transactions?_sort=price&_order=asc
```

👈🏻 **Combined queries** (for example, search and sort at the same time):

```
http://localhost:3001/transactions?refId_like=123&_sort=price&_order=asc
```
