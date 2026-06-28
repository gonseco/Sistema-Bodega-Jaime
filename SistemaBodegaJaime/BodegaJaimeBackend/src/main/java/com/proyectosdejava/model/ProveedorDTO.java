package com.proyectosdejava.model;

public class ProveedorDTO {

    private Integer codigo;
    private String nombre;
    private String ruc;
    private String telefono;
    private String direccion;

    public ProveedorDTO(Integer codigo, String nombre, String ruc, String telefono, String direccion) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.ruc = ruc;
        this.telefono = telefono;
        this.direccion = direccion;
    }

    public Integer getCodigo() { return codigo; }

    public String getNombre() { return nombre; }

    public String getRuc() { return ruc; }

    public String getTelefono() { return telefono; }
    
    public String getDireccion() { return direccion; }
}
