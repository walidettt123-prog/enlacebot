<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WorkHub - Dashboard</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <div class="app-container">
        <!-- Navbar -->
        <nav class="top-nav">
            <div class="nav-left">
                <div class="logo">
                    <i class="fas fa-bolt"></i>
                    <span>WorkHub</span>
                </div>
            </div>
            <div class="nav-right">
                <span style="margin-right:15px; color:#94a3b8;">Hola, <%= user.username %></span>
                <a href="/admin" class="btn-secondary">Administrar</a>
                <a href="/logout" class="logout-btn"><i class="fas fa-sign-out-alt"></i></a>
            </div>
        </nav>

        <div class="main-content">
            <div class="dashboard-header">
                <h1><i class="fas fa-home"></i> Panel de Trabajo</h1>
                <p>Bienvenido, <%= user.username %>. Accede a tus herramientas.</p>
            </div>

            <!-- Buscador -->
            <div class="search-box" style="max-width:400px; margin-bottom:30px;">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Buscar enlaces..." onkeyup="filterLinks()">
            </div>

            <!-- Favoritos -->
            <% if (favorites && favorites.length > 0) { %>
            <div class="section">
                <div class="section-header">
                    <h2><i class="fas fa-star"></i> Favoritos</h2>
                </div>
                <div class="cards-grid">
                    <% favorites.forEach(link => { %>
                        <a href="<%= link.url %>" target="_blank" class="card favorite-card">
                            <div class="card-icon">
                                <i class="fas fa-link"></i>
                            </div>
                            <div class="card-content">
                                <h3><%= link.title %></h3>
                                <p><%= link.category_name || 'General' %></p>
                            </div>
                        </a>
                    <% }) %>
                </div>
            </div>
            <% } %>

            <!-- Por categorías -->
            <% if (categories && categories.length > 0) { %>
                <% categories.forEach(category => { %>
                    <% const catLinks = linksByCategory[category.id] || []; %>
                    <% if (catLinks.length > 0) { %>
                    <div class="section">
                        <div class="section-header">
                            <h2><i class="fas fa-folder"></i> <%= category.name %></h2>
                            <span class="badge"><%= catLinks.length %></span>
                        </div>
                        <div class="cards-grid">
                            <% catLinks.forEach(link => { %>
                                <a href="<%= link.url %>" target="_blank" class="card">
                                    <div class="card-icon">
                                        <i class="fas fa-link"></i>
                                    </div>
                                    <div class="card-content">
                                        <h3><%= link.title %></h3>
                                        <p><%= link.url.replace('https://','').split('/')[0] %></p>
                                    </div>
                                </a>
                            <% }) %>
                        </div>
                    </div>
                    <% } %>
                <% }) %>
            <% } else { %>
                <p style="color:#94a3b8;">No hay enlaces todavía. Ve al panel de administración para añadirlos.</p>
            <% } %>
        </div>
    </div>

    <script>
        function filterLinks() {
            const term = document.getElementById('searchInput').value.toLowerCase();
            document.querySelectorAll('.card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(term) ? '' : 'none';
            });
        }
    </script>
</body>
</html>
