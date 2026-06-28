package com.proyectosdejava.repository;

import com.proyectosdejava.model.ComprobanteDTO;
import com.proyectosdejava.model.DetalleComprobanteDTO;
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
public class ComprobanteRepository {

    @PersistenceContext
    private EntityManager em;

    public List<ComprobanteDTO> buscar(String tipo, Integer estado) {
        List<Object[]> filas = em.createStoredProcedureQuery("sp_buscar_comprobantes")
                .registerStoredProcedureParameter(1, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN)
                .setParameter(1, tipo)
                .setParameter(2, estado)
                .getResultList();

        return filas.stream().map(f -> new ComprobanteDTO(
                (Integer)    f[0],
                (String)     f[1],
                (String)     f[2],
                (Integer)    f[3],
                (String)     f[4],
                (String)     f[5],
                (String)     f[6],
                ((Timestamp) f[7]).toLocalDateTime(),
                (BigDecimal) f[8],
                ((Number)    f[9]).intValue()
        )).collect(Collectors.toList());
    }

    public List<DetalleComprobanteDTO> listarDetalle(Integer idComprobante) {
        List<Object[]> filas = em.createStoredProcedureQuery("sp_detalle_comprobante_listar")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .setParameter(1, idComprobante)
                .getResultList();

        return filas.stream().map(f -> new DetalleComprobanteDTO(
                (Integer)    f[0],
                (String)     f[1],
                (Integer)    f[2],
                (BigDecimal) f[3],
                (BigDecimal) f[4]
        )).collect(Collectors.toList());
    }

    public Object[] crear(Integer idUsuario, String tipo, String serie,
                          String nombreCliente, String rucCliente) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_comprobante_crear")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, String.class,  ParameterMode.IN)
                .registerStoredProcedureParameter(3, String.class,  ParameterMode.IN)
                .registerStoredProcedureParameter(4, String.class,  ParameterMode.IN)
                .registerStoredProcedureParameter(5, String.class,  ParameterMode.IN)
                .registerStoredProcedureParameter(6, Integer.class, ParameterMode.OUT)
                .registerStoredProcedureParameter(7, String.class,  ParameterMode.OUT)
                .setParameter(1, idUsuario)
                .setParameter(2, tipo)
                .setParameter(3, serie)
                .setParameter(4, nombreCliente)
                .setParameter(5, rucCliente);
        q.execute();
        return new Object[]{ q.getOutputParameterValue(6), q.getOutputParameterValue(7) };
    }

    public String agregarDetalle(Integer idComprobante, Integer idProducto,
                                 Integer cantidad, BigDecimal precioUnitario) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_detalle_comprobante_crear")
                .registerStoredProcedureParameter(1, Integer.class,    ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class,    ParameterMode.IN)
                .registerStoredProcedureParameter(3, Integer.class,    ParameterMode.IN)
                .registerStoredProcedureParameter(4, BigDecimal.class, ParameterMode.IN)
                .registerStoredProcedureParameter(5, String.class,     ParameterMode.OUT)
                .setParameter(1, idComprobante)
                .setParameter(2, idProducto)
                .setParameter(3, cantidad)
                .setParameter(4, precioUnitario);
        q.execute();
        return (String) q.getOutputParameterValue(5);
    }

    public String anular(Integer idComprobante) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_comprobante_anular")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, String.class,  ParameterMode.OUT)
                .setParameter(1, idComprobante);
        q.execute();
        return (String) q.getOutputParameterValue(2);
    }
}