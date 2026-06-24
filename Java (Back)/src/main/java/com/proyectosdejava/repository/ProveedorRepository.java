package com.proyectosdejava.repository;

import com.proyectosdejava.model.ProveedorDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class ProveedorRepository {

    @PersistenceContext
    private EntityManager em;

    private List<ProveedorDTO> ejecutarBusqueda(String spNombre, String nombre) {
        List<Object[]> filas = em.createStoredProcedureQuery(spNombre)
                .registerStoredProcedureParameter(1, String.class, ParameterMode.IN)
                .setParameter(1, nombre)
                .getResultList();

        return filas.stream().map(f -> new ProveedorDTO(
                (Integer) f[0],
                (String) f[1],
                (String) f[2],
                (String) f[3],
                (String) f[4]
        )).collect(Collectors.toList());
    }

    public List<ProveedorDTO> buscarActivos(String nombre) {
        return ejecutarBusqueda("sp_buscar_proveedores_activos", nombre);
    }

    public List<ProveedorDTO> buscarInactivos(String nombre) {
        return ejecutarBusqueda("sp_buscar_proveedores_inactivos", nombre);
    }

    public String crear(String nombre, String ruc, String telefono, String direccion) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_proveedor_crear")
                .registerStoredProcedureParameter(1, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(4, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(5, String.class, ParameterMode.OUT)
                .setParameter(1, nombre)
                .setParameter(2, ruc)
                .setParameter(3, telefono)
                .setParameter(4, direccion);
        q.execute();
        return (String) q.getOutputParameterValue(5);
    }

    public String editar(Integer idProveedor, String nombre, String ruc, String telefono, String direccion) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_proveedor_editar")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(4, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(5, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(6, String.class, ParameterMode.OUT)
                .setParameter(1, idProveedor)
                .setParameter(2, nombre)
                .setParameter(3, ruc)
                .setParameter(4, telefono)
                .setParameter(5, direccion);
        q.execute();
        return (String) q.getOutputParameterValue(6);
    }

    public String cambiarEstado(Integer idProveedor, Integer estado) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_proveedor_cambiar_estado")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, String.class, ParameterMode.OUT)
                .setParameter(1, idProveedor)
                .setParameter(2, estado);
        q.execute();
        return (String) q.getOutputParameterValue(3);
    }
}
