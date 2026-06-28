package com.proyectosdejava.model;

import jakarta.persistence.*;

@Entity
@Table(name = "proveedor")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor")
    private Integer idProveedor;

    private String nombre;
    private String ruc;
    private String telefono;
    private String direccion;
    private Integer estado;

    public Integer getIdProveedor() { return idProveedor; }

    public void setIdProveedor(Integer idProveedor) { this.idProveedor = idProveedor; }

    public String getNombre() { return nombre; }

    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getRuc() { return ruc; }

    public void setRuc(String ruc) { this.ruc = ruc; }

    public String getTelefono() { return telefono; }

    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }

    public void setDireccion(String direccion) { this.direccion = direccion; }

    public Integer getEstado() { return estado; }

    public void setEstado(Integer estado) { this.estado = estado; }
}