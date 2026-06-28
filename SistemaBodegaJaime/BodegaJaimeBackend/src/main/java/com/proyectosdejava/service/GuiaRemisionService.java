package com.proyectosdejava.service;

import com.proyectosdejava.model.DetalleGuiaRemisionDTO;
import com.proyectosdejava.model.GuiaRemisionDTO;
import com.proyectosdejava.repository.GuiaRemisionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GuiaRemisionService {

    @Autowired
    private GuiaRemisionRepository guiaRemisionRepository;

    public List<GuiaRemisionDTO> buscar(Integer idOrdenCompra) {
        return guiaRemisionRepository.buscar(idOrdenCompra);
    }

    public List<DetalleGuiaRemisionDTO> listarDetalle(Integer idGuiaRemision) {
        return guiaRemisionRepository.listarDetalle(idGuiaRemision);
    }

    @Transactional
    public Map<String, Object> crear(Integer idOrdenCompra, Integer idUsuario, String numeroGuia) {
        Object[] resultado = guiaRemisionRepository.crear(idOrdenCompra, idUsuario, numeroGuia);
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idGenerado", resultado[0]);
        respuesta.put("mensaje", resultado[1]);
        return respuesta;
    }

    @Transactional
    public Map<String, String> agregarDetalle(Integer idGuiaRemision, Integer idProducto, Integer cantidad) {
        return buildRespuesta(guiaRemisionRepository.agregarDetalle(idGuiaRemision, idProducto, cantidad));
    }

    @Transactional
    public Map<String, String> anular(Integer idGuiaRemision) {
        return buildRespuesta(guiaRemisionRepository.anular(idGuiaRemision));
    }

    private Map<String, String> buildRespuesta(String resultado) {
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", resultado);
        return respuesta;
    }
}