package com.proyectosdejava.model;

public class DetalleGuiaRemisionDTO {

    private Integer codigo;
    private String producto;
    private Integer cantidad;

    public DetalleGuiaRemisionDTO(Integer codigo, String producto, Integer cantidad) {
        this.codigo = codigo;
        this.producto = producto;
        this.cantidad = cantidad;
    }

    public Integer getCodigo() { return codigo; }

    public String getProducto() { return producto; }

    public Integer getCantidad() { return cantidad; }
}
