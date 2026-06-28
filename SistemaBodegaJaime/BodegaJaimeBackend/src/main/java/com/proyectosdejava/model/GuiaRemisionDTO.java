package com.proyectosdejava.model;

import java.time.LocalDateTime;

public class GuiaRemisionDTO {

    private Integer codigo;
    private String numeroGuia;
    private Integer idOrdenCompra;
    private String proveedor;
    private String usuario;
    private LocalDateTime fecha;
    private Integer estado;

    public GuiaRemisionDTO(Integer codigo, String numeroGuia, Integer idOrdenCompra, String proveedor,
                           String usuario, LocalDateTime fecha, Integer estado) {
        this.codigo = codigo;
        this.numeroGuia = numeroGuia;
        this.idOrdenCompra = idOrdenCompra;
        this.proveedor = proveedor;
        this.usuario = usuario;
        this.fecha = fecha;
        this.estado = estado;
    }

    public Integer getCodigo() { return codigo; }

    public String getNumeroGuia() { return numeroGuia; }

    public Integer getIdOrdenCompra() { return idOrdenCompra; }

    public String getProveedor() { return proveedor; }

    public String getUsuario() { return usuario; }

    public LocalDateTime getFecha() { return fecha; }
    
    public Integer getEstado() { return estado; }
}
