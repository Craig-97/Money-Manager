// Production reaches the API through the site's own origin (a Netlify rewrite), so the httpOnly
// refresh cookie is first-party. Development goes through Vite's proxy in the same way.
export const apiUrl = import.meta.env.VITE_API_URL ?? '/graphql';
