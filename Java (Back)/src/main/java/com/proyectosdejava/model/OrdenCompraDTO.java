package com.proyectosdejava.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrdenCompraDTO {

    private Integer codigo;
    private String proveedor;
    private String usuario;
    private LocalDateTime fecha;
    private BigDecimal total;
    private String estado;

    public OrdenCompraDTO(Integer codigo, String proveedor, String usuario,
                          LocalDateTime fecha, BigDecimal total, String estado) {
        this.codigo = codigo;
        this.proveedor = proveedor;
        this.usuario = usuario;
        this.fecha = fecha;
        this.total = total;
        this.estado = estado;
    }

    public Integer getCodigo() { return codigo; }

    public String getProveedor() { return proveedor; }

    public String getUsuario() { return usuario; }

    public LocalDateTime getFecha() { return fecha; }

    public BigDecimal getTotal() { return total; }

    public String getEstado() { return estado; }
}