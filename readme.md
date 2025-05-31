## Step JWT
### Simple but not the best way.
1. From client side
2. generate token jwt.sign()
3. on the client side set token to the localStorage


### Using http only cookies
1. form client side send the information (email, better: firebase er auth token) to generate token
2. On the server side accept user information and if needed validate it
3. generate the server side using secret and expiresIn


## SET THE COOKIES
1.  set the withCredentials in the client side (where i am sign-in or sign-up) and this value always be true
2. set the value