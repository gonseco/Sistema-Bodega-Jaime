package com.proyectosdejava.model;

public class Comprobante {

    private Integer idUsuario;
    private String tipo;
    private String serie;
    private String nombreCliente;
    private String rucCliente;

    public Integer getIdUsuario() { return idUsuario; }

    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getTipo() { return tipo; }

    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getSerie() { return serie; }

    public void setSerie(String serie) { this.serie = serie; }

    public String getNombreCliente() { return nombreCliente;}

    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getRucCliente() { return rucCliente; }

    public void setRucCliente(String rucCliente) { this.rucCliente = rucCliente; }

}
