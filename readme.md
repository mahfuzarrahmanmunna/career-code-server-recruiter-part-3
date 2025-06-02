## 🔐 Step JWT

### 🟡 Simple but not the best way

1. From client side
2. Generate token using `jwt.sign()`
3. On the client side, set token to `localStorage`

---

### ✅ Using HttpOnly Cookies

1. From client side, send the information (email, or better: Firebase Auth token) to generate token
2. On the server side, accept user information and validate it if needed
3. Generate the token server-side using secret and `expiresIn`

---

## 🍪 SET THE COOKIES

1. Set `withCredentials: true` on the client side (where you sign in or sign up)

```js
axios.post('http://localhost:3000/jwt', userData, {
  withCredentials: true
});
```

2. On the server side, set `credentials: true` and `origin` inside the CORS middleware:

```js
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
```

> ✅ `credentials: true` means you are allowing cookies to be sent and received.

3. After generating the token, set it to cookies with some options:

```js
// Set the token in the cookies
res.cookie('token', token, {
  httpOnly: true,
  secure: false, // Set true in production with HTTPS
  sameSite: 'strict', // Optional: for CSRF protection
  maxAge: 24 * 60 * 60 * 1000 // 1 day
});
```

4. Use cookiesParser as middleware
5. In the client side : if using axios withCredentials : true for fetch : credentials include
6. checked token exists. if not, return 401 --> unauthorized
7. jwt.verify function


# JWT Using Firebase
