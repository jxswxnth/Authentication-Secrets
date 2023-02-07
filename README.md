# Learning Authentication and Security
- [x] Username and Password only <br />
document find on DB collection
- [x] Encrypted password <br />
Used `mongoose-encryption` - A Simple Encryption and Authentication for mongoose documents which takes a custom string to encrypt a password. Even if someone gains access to the database, they will not be able to view the encrypted fields without the decryption key.
- [x] Hashing with md5<br />
Used `md5` - MD5 (Message Digest Method 5) is a cryptographic hash algorithm used to generate a 128-bit digest from a string of any length.
- [x] Hashing and Salting with bcrypt<br />
Used `bcrypt` Bcrypt is a password-based key derivation function that uses a slow hash function and a unique salt value to store passwords securely. It hashes a password and salt combination multiple times to make it computationally infeasible for an attacker to guess the original password.
- [x] Cookies and Sessions<br />
Used `passport`, `passport-local-mongoose` and `express session` to validate user sessions
- [x] Google OAuth 2.0 Authentication<br />
Used `passport-google-oauth20`

### Home Page
![image](https://user-images.githubusercontent.com/78472787/217305293-c9e4b902-43cc-4681-8313-49fa6fccef27.png)

### Register Page
![image](https://user-images.githubusercontent.com/78472787/217305308-6f5786ec-a233-429f-a8f7-70e7fdc15e44.png)

### Login Page
![image](https://user-images.githubusercontent.com/78472787/217305322-cae61761-9b22-4dc1-9d2a-fb2ed217f913.png)

### Secret Page
![image](https://user-images.githubusercontent.com/78472787/217305658-f485c43c-b502-4bdb-afdb-94c981c4ffb1.png)
