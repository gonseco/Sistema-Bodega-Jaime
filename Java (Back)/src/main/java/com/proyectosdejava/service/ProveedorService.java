package com.proyectosdejava.service;

import com.proyectosdejava.model.ProveedorDTO;
import com.proyectosdejava.repository.ProveedorRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    public List<ProveedorDTO> buscarActivos(String nombre) {
        return proveedorRepository.buscarActivos(nombre);
    }

    public List<ProveedorDTO> buscarInactivos(String nombre) {
        return proveedorRepository.buscarInactivos(nombre);
    }

    @Transactional
    public Map<String, String> crear(String nombre, String ruc, String telefono, String direccion) {
        return buildRespuesta(proveedorRepository.crear(nombre, ruc, telefono, direccion));
    }

    @Transactional
    public Map<String, String> editar(Integer idProveedor, String nombre, String ruc, String telefono, String direccion) {
        return buildRespuesta(proveedorRepository.editar(idProveedor, nombre, ruc, telefono, direccion));
    }

    @Transactional
    public Map<String, String> cambiarEstado(Integer idProveedor, Integer estado) {
        return buildRespuesta(proveedorRepository.cambiarEstado(idProveedor, estado));
    }

    private Map<String, String> buildRespuesta(String resultado) {
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", resultado);
        return respuesta;
    }
}
