package com.proyectosdejava.service;

import com.proyectosdejava.model.ComprobanteDTO;
import com.proyectosdejava.model.DetalleComprobanteDTO;
import com.proyectosdejava.repository.ComprobanteRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ComprobanteService {

    @Autowired
    private ComprobanteRepository comprobanteRepository;

    public List<ComprobanteDTO> buscar(String tipo, Integer estado) {
        return comprobanteRepository.buscar(tipo, estado);
    }

    public List<DetalleComprobanteDTO> listarDetalle(Integer idComprobante) {
        return comprobanteRepository.listarDetalle(idComprobante);
    }

    @Transactional
    public Map<String, Object> crear(Integer idUsuario, String tipo, String serie,
                                     String nombreCliente, String rucCliente) {
        Object[] resultado = comprobanteRepository.crear(idUsuario, tipo, serie, nombreCliente, rucCliente);
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idGenerado", resultado[0]);
        respuesta.put("mensaje", resultado[1]);
        return respuesta;
    }

    @Transactional
    public Map<String, String> agregarDetalle(Integer idComprobante, Integer idProducto,
                                              Integer cantidad, BigDecimal precioUnitario) {
        return buildRespuesta(comprobanteRepository.agregarDetalle(idComprobante, idProducto, cantidad, precioUnitario));
    }

    @Transactional
    public Map<String, String> anular(Integer idComprobante) {
        return buildRespuesta(comprobanteRepository.anular(idComprobante));
    }

    private Map<String, String> buildRespuesta(String resultado) {
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", resultado);
        return respuesta;
    }
}
