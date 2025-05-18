/**
 * @fileoverview This file defines example Data Transfer Object (DTO) structures
 * for the e-commerce application. These DTOs represent the expected shape of data
 * for API communication (even if mocked) and data transfer between components.
 */

// --- Product DTOs ---

/**
 * Represents a product as it would typically be retrieved from an API or displayed.
 * @typedef {object} ProductDTO
 * @property {string} id - Unique identifier for the product.
 * @property {string} name - Name of the product.
 * @property {string} description - Detailed description of the product.
 * @property {number} price - Price of the product.
 * @property {string} category - Category the product belongs to.
 * @property {string} image - URL or path to the product image.
 * @property {string} sellerId - Identifier of the seller who listed the product.
 * @property {string} [dateAdded] - Optional: ISO date string when the product was added.
 * @property {number} [stockQuantity] - Optional: Available stock quantity.
 * @property {Array<ReviewDTO>} [reviews] - Optional: Array of reviews for the product.
 * @property {number} [averageRating] - Optional: Calculated average rating.
 */
// Example: Your products.json items should align with this structure.

/**
 * Represents the data structure for creating a new product.
 * This is what the frontend might send to a (mock) API.
 * @typedef {object} CreateProductDTO
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} category
 * @property {string} image - (In a real app, this might be a file to upload or a temporary URL)
 * For this project, it's the mock URL we generate.
 * @property {string} sellerId - Automatically added based on the logged-in seller.
 */
// Example: The formData in AddProduct.jsx, before adding id and sellerId, aligns with this.

/**
 * Represents the data structure for updating an existing product.
 * Could include all fields or only those that are updatable.
 * @typedef {object} UpdateProductDTO
 * @property {string} [name] - Optional: New name.
 * @property {string} [description] - Optional: New description.
 * @property {number} [price] - Optional: New price.
 * @property {string} [category] - Optional: New category.
 * @property {string} [image] - Optional: New image URL or indicator of new image file.
 */
// Example: The formData in EditProduct.jsx aligns with this.

// --- User DTOs ---

/**
 * Represents user information, applicable to both Buyers and Sellers.
 * @typedef {object} UserDTO
 * @property {string} id - Unique user identifier.
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {'Buyer' | 'Seller'} role
 * @property {string} [joinDate] - Optional: ISO date string.
 */
// Example: Your buyers.json and sellers.json items should align with this.

/**
 * Represents the data structure for user registration (signup).
 * @typedef {object} RegisterUserDTO
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password - Raw password (would be hashed by backend).
 * @property {'Buyer' | 'Seller'} role
 */
// Example: The formData in SignupSigninModal.jsx (signup tab) aligns with this.

/**
 * Represents the data structure for user login (signin).
 * @typedef {object} LoginCredentialsDTO
 * @property {string} email
 * @property {string} password
 */
// Example: The formData in SignupSigninModal.jsx (signin tab) aligns with this.

/**
 * Represents the response from a successful authentication (login/signup).
 * @typedef {object} AuthResponseDTO
 * @property {UserDTO} user - The authenticated user's details.
 * @property {string} token - The authentication token (e.g., JWT).
 */
// Example: Conceptually, what your useAuth/useBuyerAuth login functions receive/store.

// --- Message DTOs ---

/**
 * Represents a message exchanged between a buyer and a seller.
 * @typedef {object} MessageDTO
 * @property {string} id - Unique message identifier.
 * @property {string} senderId - ID of the user who sent the message.
 * @property {string} senderName - Name of the sender.
 * @property {string} receiverId - ID of the user who will receive the message.
 * @property {string} [receiverName] - Optional: Name of the receiver.
 * @property {string} content - The text content of the message.
 * @property {string} date - ISO date string when the message was sent.
 * @property {string} [productId] - Optional: ID of the product the message is about.
 * @property {boolean} [isRead] - Optional: Indicates if the message has been read by the receiver.
 */
// Example: Your messages.json items and messages handled in messaging components should align.

/**
 * Represents the data structure for sending a new message.
 * @typedef {object} CreateMessageDTO
 * @property {string} receiverId
 * @property {string} content
 * @property {string} [productId]
 */
// Example: Data collected when a user types and sends a message.

// --- Review DTOs (If you implement reviews later) ---

/**
 * Represents a product review.
 * @typedef {object} ReviewDTO
 * @property {string} id - Unique review identifier.
 * @property {string} productId - ID of the product being reviewed.
 * @property {string} userId - ID of the user who wrote the review.
 * @property {string} userName - Name of the user who wrote the review.
 * @property {number} rating - Rating given (e.g., 1-5 stars).
 * @property {string} comment - Text content of the review.
 * @property {string} date - ISO date string when the review was posted.
 */

/**
 * Represents the data structure for submitting a new review.
 * @typedef {object} CreateReviewDTO
 * @property {string} productId
 * @property {number} rating
 * @property {string} comment
 */

// You can export these types if using JSDoc with a TypeScript-aware editor,
// or just use them as conceptual guides. For actual type checking in JS,
// you might use PropTypes or a library like Zod if you were doing runtime validation.
// For this project, defining them with JSDoc comments is sufficient for documentation.

// Example of how you might conceptually use one:
// const productFromApi = { id: "1", name: "T-Shirt", ... }; // Conforms to ProductDTO
// const newProductData = { name: "New Jeans", price: 50, ... }; // Conforms to CreateProductDTO
