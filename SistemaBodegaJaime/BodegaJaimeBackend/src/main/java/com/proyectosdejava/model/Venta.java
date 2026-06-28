package com.proyectosdejava.model;

import java.util.List;

public class Venta {

    private Integer idUsuario;
    private List<DetalleVenta> detalles;

    private String tipoComprobante;
    private String serieComprobante;
    private String nombreCliente;
    private String rucCliente;

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public List<DetalleVenta> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleVenta> detalles) { this.detalles = detalles; }

    public String getTipoComprobante() {
        return (tipoComprobante == null || tipoComprobante.isBlank()) ? "BOLETA" : tipoComprobante;
    }
    public void setTipoComprobante(String tipoComprobante) { this.tipoComprobante = tipoComprobante; }

    public String getSerieComprobante() {
        if (serieComprobante != null && !serieComprobante.isBlank()) return serieComprobante;
        return "FACTURA".equalsIgnoreCase(getTipoComprobante()) ? "F001" : "B001";
    }
    public void setSerieComprobante(String serieComprobante) { this.serieComprobante = serieComprobante; }

    public String getNombreCliente() {
        return (nombreCliente == null || nombreCliente.isBlank()) ? "Cliente" : nombreCliente;
    }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getRucCliente() { return rucCliente; }
    public void setRucCliente(String rucCliente) { this.rucCliente = rucCliente; }
}