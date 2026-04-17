package main

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// User struct
type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// Simulasi Database di Memory
var (
	users = []User{}
	mu    sync.Mutex // Mutex untuk mencegah race condition (data collision) saat concurrent akses
)

func main() {
	r := gin.Default()

	// Middleware CORS (Agar Frontend di port 5173 bisa akses Backend di 8080)
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin) // Set dynamic origin agar support allow-credentials
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Routes
	r.GET("/users", getUsers)
	r.POST("/users", createUser)
	r.PUT("/users/:id", updateUser)
	r.DELETE("/users/:id", deleteUser)

	// Jalan di port 8080
	r.Run(":8080")
}

// GET: Ambil semua user
func getUsers(c *gin.Context) {
	mu.Lock()
	defer mu.Unlock()
	c.JSON(http.StatusOK, users)
}

// POST: Buat user baru
func createUser(c *gin.Context) {
	var newUser User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newUser.ID = uuid.New().String() // Generate ID unik

	mu.Lock()
	users = append(users, newUser)
	mu.Unlock()

	c.JSON(http.StatusCreated, newUser)
}

// PUT: Update user
func updateUser(c *gin.Context) {
	id := c.Param("id")
	var updatedData User
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mu.Lock()
	defer mu.Unlock()
	for i, u := range users {
		if u.ID == id {
			users[i].Name = updatedData.Name
			users[i].Email = updatedData.Email
			c.JSON(http.StatusOK, users[i])
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
}

// DELETE: Hapus user
func deleteUser(c *gin.Context) {
	id := c.Param("id")

	mu.Lock()
	defer mu.Unlock()
	for i, u := range users {
		if u.ID == id {
			// Hapus dari slice
			users = append(users[:i], users[i+1:]...)
			c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
}