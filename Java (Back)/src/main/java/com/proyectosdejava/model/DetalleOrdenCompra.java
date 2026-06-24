package com.proyectosdejava.model;

import java.math.BigDecimal;

public class DetalleOrdenCompra {

    private Integer idProducto;
    private Integer cantidad;
    private BigDecimal precioUnitario;

    public Integer getIdProducto() { return idProducto; }

    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

    public Integer getCantidad() { return cantidad; }

    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }

    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
}