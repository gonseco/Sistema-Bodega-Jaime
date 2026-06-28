package com.proyectosdejava.repository;

import com.proyectosdejava.model.ProductoDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class ProductoRepository {

    @PersistenceContext
    private EntityManager em;

    private List<ProductoDTO> ejecutarBusqueda(String spNombre, String nombre, String marca, String categoria) {
        List<Object[]> filas = em.createStoredProcedureQuery(spNombre)
                .registerStoredProcedureParameter(1, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, String.class, ParameterMode.IN)
                .setParameter(1, nombre)
                .setParameter(2, marca)
                .setParameter(3, categoria)
                .getResultList();

        return filas.stream().map(f -> new ProductoDTO(
                (Integer)    f[0],
                (String)     f[1],
                (String)     f[2],
                (String)     f[3],
                (String)     f[4],
                (BigDecimal) f[5],   // stockActual — DECIMAL
                (BigDecimal) f[6],   // stockMinimo — DECIMAL
                (BigDecimal) f[7],
                (String)     f[8]
        )).collect(Collectors.toList());
    }

    public List<ProductoDTO> buscarActivos(String nombre, String marca, String categoria) {
        return ejecutarBusqueda("sp_buscar_productos_activos", nombre, marca, categoria);
    }

    public List<ProductoDTO> buscarInactivos(String nombre, String marca, String categoria) {
        return ejecutarBusqueda("sp_buscar_productos_inactivos", nombre, marca, categoria);
    }

    public String crearProducto(Integer idMarca, Integer idCategoria, Integer idUnidadDeMedida,
                                String nombre, BigDecimal stockActual,
                                BigDecimal stockMinimo, BigDecimal precioVenta) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_producto_crear")
                .registerStoredProcedureParameter(1, Integer.class,    ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class,    ParameterMode.IN)
                .registerStoredProcedureParameter(3, Integer.class,    ParameterMode.IN)
                .registerStoredProcedureParameter(4, String.class,     ParameterMode.IN)
                .registerStoredProcedureParameter(5, BigDecimal.class, ParameterMode.IN)
                .registerStoredProcedureParameter(6, BigDecimal.class, ParameterMode.IN)
                .registerStoredProcedureParameter(7, BigDecimal.class, ParameterMode.IN)
                .registerStoredProcedureParameter(8, String.class,     ParameterMode.OUT)
                .setParameter(1, idMarca)
                .setParameter(2, idCategoria)
                .setParameter(3, idUnidadDeMedida)
                .setParameter(4, nombre)
                .setParameter(5, stockActual)
                .setParameter(6, stockMinimo)
                .setParameter(7, precioVenta);
        q.execute();
        return (String) q.getOutputParameterValue(8);
    }

    public String editarProducto(Integer idProducto, Integer idMarca, Integer idCategoria,
                                 Integer idUnidadDeMedida, String nombre, BigDecimal precioVenta) {
        em.createNativeQuery("CALL sp_producto_editar(:idProducto, :idMarca, :idCategoria, " +
                        ":idUnidadDeMedida, :nombre, NULL, NULL, :precioVenta, @resultado)")
                .setParameter("idProducto",       idProducto)
                .setParameter("idMarca",          idMarca)
                .setParameter("idCategoria",      idCategoria)
                .setParameter("idUnidadDeMedida", idUnidadDeMedida)
                .setParameter("nombre",           nombre)
                .setParameter("precioVenta",      precioVenta)
                .executeUpdate();
        return (String) em.createNativeQuery("SELECT @resultado").getSingleResult();
    }

    public String cambiarEstado(Integer idProducto, Integer estado) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_producto_cambiar_estado")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, String.class,  ParameterMode.OUT)
                .setParameter(1, idProducto)
                .setParameter(2, estado);
        q.execute();
        return (String) q.getOutputParameterValue(3);
    }
}