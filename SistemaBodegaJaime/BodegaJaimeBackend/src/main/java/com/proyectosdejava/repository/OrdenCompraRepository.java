package com.proyectosdejava.repository;

import com.proyectosdejava.model.DetalleOrdenCompraDTO;
import com.proyectosdejava.model.OrdenCompraDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class OrdenCompraRepository {

    @PersistenceContext
    private EntityManager em;

    public List<OrdenCompraDTO> buscar(String estado) {
        List<Object[]> filas = em.createStoredProcedureQuery("sp_buscar_ordenes_compra")
                .registerStoredProcedureParameter(1, String.class, ParameterMode.IN)
                .setParameter(1, estado)
                .getResultList();

        return filas.stream().map(f -> new OrdenCompraDTO(
                (Integer) f[0],
                (String) f[1],
                (String) f[2],
                ((Timestamp) f[3]).toLocalDateTime(),
                (BigDecimal) f[4],
                (String) f[5]
        )).collect(Collectors.toList());
    }

    public List<DetalleOrdenCompraDTO> listarDetalle(Integer idOrdenCompra) {
        List<Object[]> filas = em.createStoredProcedureQuery("sp_detalle_orden_compra_listar")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .setParameter(1, idOrdenCompra)
                .getResultList();

        return filas.stream().map(f -> new DetalleOrdenCompraDTO(
                (Integer) f[0],
                (Integer) f[1],
                (String) f[2],
                (Integer) f[3],
                (BigDecimal) f[4],
                (BigDecimal) f[5],
                (Integer) f[6]
        )).collect(Collectors.toList());
    }

    /** Devuelve [idGenerado, mensaje] */
    public Object[] crear(Integer idProveedor, Integer idUsuario) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_orden_compra_crear")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, Integer.class, ParameterMode.OUT)
                .registerStoredProcedureParameter(4, String.class, ParameterMode.OUT)
                .setParameter(1, idProveedor)
                .setParameter(2, idUsuario);
        q.execute();
        Integer idGenerado = (Integer) q.getOutputParameterValue(3);
        String mensaje = (String) q.getOutputParameterValue(4);
        return new Object[]{idGenerado, mensaje};
    }

    public String agregarDetalle(Integer idOrdenCompra, Integer idProducto, Integer cantidad, BigDecimal precioUnitario) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_detalle_orden_compra_crear")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(4, BigDecimal.class, ParameterMode.IN)
                .registerStoredProcedureParameter(5, String.class, ParameterMode.OUT)
                .setParameter(1, idOrdenCompra)
                .setParameter(2, idProducto)
                .setParameter(3, cantidad)
                .setParameter(4, precioUnitario);
        q.execute();
        return (String) q.getOutputParameterValue(5);
    }

    public String anular(Integer idOrdenCompra) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_orden_compra_anular")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, String.class, ParameterMode.OUT)
                .setParameter(1, idOrdenCompra);
        q.execute();
        return (String) q.getOutputParameterValue(2);
    }
}