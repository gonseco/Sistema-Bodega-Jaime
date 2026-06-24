package com.proyectosdejava.repository;

import com.proyectosdejava.model.DetalleGuiaRemisionDTO;
import com.proyectosdejava.model.GuiaRemisionDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class GuiaRemisionRepository {

    @PersistenceContext
    private EntityManager em;

    public List<GuiaRemisionDTO> buscar(Integer idOrdenCompra) {
        List<Object[]> filas = em.createStoredProcedureQuery("sp_buscar_guias_remision")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .setParameter(1, idOrdenCompra)
                .getResultList();

        return filas.stream().map(f -> new GuiaRemisionDTO(
                (Integer) f[0],
                (String) f[1],
                (Integer) f[2],
                (String) f[3],
                (String) f[4],
                ((Timestamp) f[5]).toLocalDateTime(),
                ((Number) f[6]).intValue()
        )).collect(Collectors.toList());
    }

    public List<DetalleGuiaRemisionDTO> listarDetalle(Integer idGuiaRemision) {
        List<Object[]> filas = em.createStoredProcedureQuery("sp_detalle_guia_remision_listar")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .setParameter(1, idGuiaRemision)
                .getResultList();

        return filas.stream().map(f -> new DetalleGuiaRemisionDTO(
                (Integer) f[0],
                (String) f[1],
                (Integer) f[2]
        )).collect(Collectors.toList());
    }

    /** Devuelve [idGenerado, mensaje] */
    public Object[] crear(Integer idOrdenCompra, Integer idUsuario, String numeroGuia) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_guia_remision_crear")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(4, Integer.class, ParameterMode.OUT)
                .registerStoredProcedureParameter(5, String.class, ParameterMode.OUT)
                .setParameter(1, idOrdenCompra)
                .setParameter(2, idUsuario)
                .setParameter(3, numeroGuia);
        q.execute();
        Integer idGenerado = (Integer) q.getOutputParameterValue(4);
        String mensaje = (String) q.getOutputParameterValue(5);
        return new Object[]{idGenerado, mensaje};
    }

    /** Agrega el detalle Y aumenta el stock automáticamente (vía stored procedure) */
    public String agregarDetalle(Integer idGuiaRemision, Integer idProducto, Integer cantidad) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_detalle_guia_remision_crear")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(4, String.class, ParameterMode.OUT)
                .setParameter(1, idGuiaRemision)
                .setParameter(2, idProducto)
                .setParameter(3, cantidad);
        q.execute();
        return (String) q.getOutputParameterValue(4);
    }

    public String anular(Integer idGuiaRemision) {
        StoredProcedureQuery q = em.createStoredProcedureQuery("sp_guia_remision_anular")
                .registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, String.class, ParameterMode.OUT)
                .setParameter(1, idGuiaRemision);
        q.execute();
        return (String) q.getOutputParameterValue(2);
    }
}