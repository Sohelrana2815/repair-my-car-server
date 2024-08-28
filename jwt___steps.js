/**
 * 1. install jwt token , require jwt,
 * 2. sent info from client side
 * 3. jwt.sign(payload,secret,{expiresIn: '1h'}); , sent token to client side
 *
 *
 */

/**
 * Store cookie in client site 3 method.
 * 1. memory--> ok type
 * 2. local storage--> ok type
 * 3. http only cookie (secure)
 */

/**
 * set cookies http only
 * 1. http only , secure , { options}
 * 2. cors setting
 *  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
 * 3. client site {withCredentials : true}
 */
