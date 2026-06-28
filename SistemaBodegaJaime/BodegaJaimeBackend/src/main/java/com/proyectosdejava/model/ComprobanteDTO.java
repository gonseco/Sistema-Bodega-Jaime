package com.proyectosdejava.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ComprobanteDTO {

    private Integer codigo;
    private String tipo;
    private String serie;
    private Integer correlativo;
    private String cliente;
    private String ruc;
    private String usuario;
    private LocalDateTime fecha;
    private BigDecimal total;
    private Integer estado;

    public ComprobanteDTO(Integer codigo, String tipo, String serie, Integer correlativo,
                          String cliente, String ruc, String usuario,
                          LocalDateTime fecha, BigDecimal total, Integer estado) {
        this.codigo = codigo;
        this.tipo = tipo;
        this.serie = serie;
        this.correlativo = correlativo;
        this.cliente = cliente;
        this.ruc = ruc;
        this.usuario = usuario;
        this.fecha = fecha;
        this.total = total;
        this.estado = estado;
    }

    public Integer getCodigo() { return codigo; }

    public String getTipo() { return tipo; }

    public String getSerie() { return serie; }

    public Integer getCorrelativo() { return correlativo; }

    public String getCliente() { return cliente; }

    public String getRuc() { return ruc; }

    public String getUsuario() { return usuario; }

    public LocalDateTime getFecha() { return fecha; }

    public BigDecimal getTotal() { return total; }
    
    public Integer getEstado() { return estado; }
}
