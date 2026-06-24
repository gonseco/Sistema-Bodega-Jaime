package com.proyectosdejava.model;

import java.math.BigDecimal;

public class DetalleComprobanteDTO {

    private Integer codigo;
    private String producto;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;

    public DetalleComprobanteDTO(Integer codigo, String producto, Integer cantidad,
                                 BigDecimal precioUnitario, BigDecimal subtotal) {
        this.codigo = codigo;
        this.producto = producto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
    }

    public Integer getCodigo() { return codigo; }

    public String getProducto() { return producto; }

    public Integer getCantidad() { return cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }

    public BigDecimal getSubtotal() { return subtotal; }
}