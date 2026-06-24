package com.proyectosdejava.model;

import java.math.BigDecimal;

public class DetalleOrdenCompraDTO {

    private Integer codigo;
    private Integer idProducto;
    private String producto;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private Integer cantidadRecibida;

    public DetalleOrdenCompraDTO(Integer codigo, Integer idProducto, String producto, Integer cantidad,
                                 BigDecimal precioUnitario, BigDecimal subtotal, Integer cantidadRecibida) {
        this.codigo = codigo;
        this.idProducto = idProducto;
        this.producto = producto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
        this.cantidadRecibida = cantidadRecibida;
    }

    public Integer getCodigo() { return codigo; }

    public Integer getIdProducto() { return idProducto; }

    public String getProducto() { return producto; }

    public Integer getCantidad() { return cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }

    public BigDecimal getSubtotal() { return subtotal; }

    public Integer getCantidadRecibida() { return cantidadRecibida; }
}