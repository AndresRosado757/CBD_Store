CREATE DATABASE IF NOT EXISTS cbd_boutique
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;

USE cbd_boutique;

-- Tabla para las categorias
CREATE TABLE CATEGORIA (
    ID_Categoria     INT            AUTO_INCREMENT PRIMARY KEY,
    Nombre_Categoria     VARCHAR(100)    NOT NULL,
    Descripcion_Categoria TEXT
);

-- Tabla de proveedores
CREATE TABLE PROVEEDOR (
    ID_Proveedor    INT             AUTO_INCREMENT PRIMARY KEY,
    Telefono_Proveedor   VARCHAR(20),
    CIF_NIF         VARCHAR(20)     NOT NULL UNIQUE,
    Contacto_Nombre VARCHAR(100),
    Nombre_Empresa  VARCHAR(150)    NOT NULL,
    Email           VARCHAR(100)
);

-- Tabla de productos con sus FK
CREATE TABLE PRODUCTO (
    ID_Producto         INT             AUTO_INCREMENT PRIMARY KEY,
    Stock_Disponible    INT             NOT NULL DEFAULT 0,
    Descripcion         TEXT,
    Tipo_Producto       VARCHAR(100),
    Precio              DECIMAL(10, 2)  NOT NULL,
    ID_Proveedor        INT             NOT NULL,
    ID_Categoria        INT             NOT NULL,
    CONSTRAINT fk_producto_proveedor FOREIGN KEY (ID_Proveedor)
        REFERENCES PROVEEDOR(ID_Proveedor)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (ID_Categoria)
        REFERENCES CATEGORIA(ID_Categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla padre de tiendas
CREATE TABLE TIENDA (
    ID_T        INT             AUTO_INCREMENT PRIMARY KEY,
    Telf        VARCHAR(20),
    Tipo_Tienda ENUM('FISICA','ONLINE') NOT NULL
);

-- Hija fisica
CREATE TABLE TIENDA_FISICA (
    ID_T        INT             PRIMARY KEY,
    Direccion   VARCHAR(200),
    Horario     VARCHAR(100),
    CONSTRAINT fk_fisica_tienda FOREIGN KEY (ID_T)
        REFERENCES TIENDA(ID_T)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- Hija online
CREATE TABLE TIENDA_ONLINE (
    ID_T        INT             PRIMARY KEY,
    URL         VARCHAR(200),
    Plataforma  VARCHAR(100),
    CONSTRAINT fk_online_tienda FOREIGN KEY (ID_T)
        REFERENCES TIENDA(ID_T)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- Datos de clientes
CREATE TABLE CLIENTE (
    ID_Cliente  INT             AUTO_INCREMENT PRIMARY KEY,
    Nombre      VARCHAR(100)    NOT NULL,
    Email       VARCHAR(100),
    Telefono    VARCHAR(20),
    Direccion   VARCHAR(200)
);

-- Tabla de ventas
CREATE TABLE VENTAS (
    ID_Venta    INT             AUTO_INCREMENT PRIMARY KEY,
    Fecha       DATE            NOT NULL,
    Metodo_Pago VARCHAR(50),
    ID_Tienda   INT             NOT NULL,
    ID_Cliente  INT             NOT NULL,
    CONSTRAINT fk_venta_tienda  FOREIGN KEY (ID_Tienda)
        REFERENCES TIENDA(ID_T)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_venta_cliente FOREIGN KEY (ID_Cliente)
        REFERENCES CLIENTE(ID_Cliente)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Detalle de cada venta (lineas)
CREATE TABLE LINEAS_VENTAS (
    ID_Linea    INT             AUTO_INCREMENT PRIMARY KEY,
    ID_Venta    INT             NOT NULL,
    ID_Producto INT             NOT NULL,
    Cantidad    INT             NOT NULL CHECK (Cantidad > 0),
    Precio      DECIMAL(10, 2)  NOT NULL,
    Subtotal    DECIMAL(10, 2)  GENERATED ALWAYS AS (Cantidad * Precio) STORED,
    CONSTRAINT fk_linea_venta    FOREIGN KEY (ID_Venta)
        REFERENCES VENTAS(ID_Venta)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_linea_producto FOREIGN KEY (ID_Producto)
        REFERENCES PRODUCTO(ID_Producto)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Metemos datos de prueba
INSERT INTO CATEGORIA (Nombre_Categoria, Descripcion_Categoria) VALUES
    ('Aceites CBD', 'Aceites'),
    ('Cremas', 'Cremas'),
    ('Cosmética Natural', 'Cuidado piel'),
    ('Packs', 'Combos');

INSERT INTO PROVEEDOR (Telefono_Proveedor, CIF_NIF, Contacto_Nombre, Nombre_Empresa, Email) VALUES
    ('912345678', 'B12345678', 'Laura Martín', 'CañamoEuro SL', 'laura@canamoeuro.com'),
    ('934567890', 'A87654321', 'Marcos Vidal', 'Natura Hemp España', 'mvidal@naturahemp.es');

INSERT INTO TIENDA (Telf, Tipo_Tienda) VALUES
    ('926100200', 'FISICA'),
    (NULL, 'ONLINE');

INSERT INTO TIENDA_FISICA (ID_T, Direccion, Horario) VALUES
    (1, 'Calle Sancho Panza, Pedro Muñoz, Ciudad Real', 'L-V 10:00-20:00');

INSERT INTO TIENDA_ONLINE (ID_T, URL, Plataforma) VALUES
    (2, 'https://www.cbdboutique.com', 'Tienda propia');

INSERT INTO PRODUCTO (Stock_Disponible, Descripcion, Tipo_Producto, Precio, ID_Proveedor, ID_Categoria) VALUES
    (50, 'Aceite CBD 10%', 'Aceite', 19.99, 1, 1),
    (50, 'Aceite CBD 20%', 'Aceite', 34.99, 1, 1),
    (40, 'Crema CBD 250 mg', 'Crema', 24.99, 2, 2),
    (30, 'Crema CBD 500 mg', 'Crema', 39.99, 2, 2),
    (25, 'Sérum facial', 'Cosmética', 29.99, 1, 3),
    (15, 'Pack Sueño', 'Pack', 39.99, 1, 4);

INSERT INTO CLIENTE (Nombre, Email, Telefono, Direccion) VALUES
    ('María García', 'maria@example.com', '612000001', 'Calle Real, 5'),
    ('José Fernández', 'jose@example.com', '623000002', 'Av. Castilla, 12'),
    ('Ana López', 'ana@example.com', NULL, 'Calle Granada, 3');

INSERT INTO VENTAS (Fecha, Metodo_Pago, ID_Tienda, ID_Cliente) VALUES
    ('2026-05-01', 'Efectivo', 1, 1),
    ('2026-05-03', 'Tarjeta', 1, 2),
    ('2026-05-05', 'Bizum', 2, 3);

INSERT INTO LINEAS_VENTAS (ID_Venta, ID_Producto, Cantidad, Precio) VALUES
    (1, 1, 2, 19.99),
    (1, 3, 1, 24.99),
    (2, 2, 1, 34.99),
    (2, 5, 1, 29.99),
    (3, 6, 1, 39.99);

-- Selects para probar que todo va bien
SELECT v.ID_Venta, c.Nombre, v.Fecha, SUM(lv.Subtotal) AS Total
FROM VENTAS v
JOIN CLIENTE c ON v.ID_Cliente = c.ID_Cliente
JOIN LINEAS_VENTAS lv ON v.ID_Venta = lv.ID_Venta
GROUP BY v.ID_Venta;

SELECT p.Descripcion, cat.Nombre_Categoria, prov.Nombre_Empresa
FROM PRODUCTO p
JOIN CATEGORIA cat ON p.ID_Categoria = cat.ID_Categoria
JOIN PROVEEDOR prov ON p.ID_Proveedor = prov.ID_Proveedor;

SELECT t.Tipo_Tienda, COUNT(v.ID_Venta) AS Ventas, SUM(lv.Subtotal) AS Pasta
FROM VENTAS v
JOIN TIENDA t ON v.ID_Tienda = t.ID_T
JOIN LINEAS_VENTAS lv ON v.ID_Venta = lv.ID_Venta
GROUP BY t.Tipo_Tienda;