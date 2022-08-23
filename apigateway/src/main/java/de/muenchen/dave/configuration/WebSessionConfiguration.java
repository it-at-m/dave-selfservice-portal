/*
 * Copyright (c): it@M - Dienstleister für Informations- und Telekommunikationstechnik
 * der Landeshauptstadt München, 2021
 */
package de.muenchen.dave.configuration;

import com.hazelcast.config.Config;
import com.hazelcast.config.EvictionPolicy;
import com.hazelcast.config.JoinConfig;
import com.hazelcast.config.MapConfig;
import com.hazelcast.config.NetworkConfig;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.server.WebSessionServerOAuth2AuthorizedClientRepository;
import org.springframework.session.MapSession;
import org.springframework.session.ReactiveMapSessionRepository;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.session.Session;
import org.springframework.session.config.annotation.web.server.EnableSpringWebSession;
import org.springframework.session.hazelcast.HazelcastIndexedSessionRepository;


/**
 * This class configures Hazelcast as the ReactiveSessionRepository.
 *
 */
@Configuration
@EnableSpringWebSession
public class WebSessionConfiguration {

    @Value("${hazelcast.instance:hazl_instance}")
    public String hazelcastInstanceName;
    @Value("${hazelcast.group-name:session_replication_group}")
    public String groupConfigName;
    @Value("${hazelcast.openshift-service-name:apigateway}")
    public String openshiftServiceName;

    @Bean
    public ServerOAuth2AuthorizedClientRepository authorizedClientRepository() {
        return new WebSessionServerOAuth2AuthorizedClientRepository();
    }

    @Bean
    public ReactiveSessionRepository<MapSession> reactiveSessionRepository(@Qualifier("hazelcastInstance") @Autowired HazelcastInstance hazelcastInstance) {
        final IMap<String, Session> map = hazelcastInstance.getMap(HazelcastIndexedSessionRepository.DEFAULT_SESSION_MAP_NAME);
        return new ReactiveMapSessionRepository(map);
    }

    @Bean
    @Profile({"local", "test"})
    public Config localConfig(@Value("${spring.session.timeout}") int timeout) {

        final Config config = new Config();
        config.setInstanceName(hazelcastInstanceName);
        config.setClusterName(groupConfigName);

        mapConfig(config, timeout);

        final NetworkConfig networkConfig = config.getNetworkConfig();

        final JoinConfig joinConfig = networkConfig.getJoin();
        joinConfig.getMulticastConfig().setEnabled(false);
        joinConfig.getTcpIpConfig()
                .setEnabled(true)
                .addMember("127.0.0.1");

        return config;
    }

    @Bean
    @Profile({"dev", "kon", "prod", "hotfix", "demo", "konexternal", "prodexternal"})
    public Config config(@Value("${spring.session.timeout}") int timeout) {

        final Config config = new Config();
        config.setInstanceName(hazelcastInstanceName);
        config.setClusterName(groupConfigName);

        mapConfig(config, timeout);

        config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
        config.getNetworkConfig().getJoin().getKubernetesConfig().setEnabled(true)
                //If we dont set a specific name, it would call -all- services within a namespace
                .setProperty("service-name", openshiftServiceName);

        return config;
    }

    // Since we are creating the map it's important to evict sessions
    // by setting a reasonable value for time to live
    // as the default is 0 which means infinite.
    private void mapConfig(Config config, int timeout) {
        final MapConfig sessionConfig = new MapConfig();
        sessionConfig.setName(HazelcastIndexedSessionRepository.DEFAULT_SESSION_MAP_NAME);
        sessionConfig.setTimeToLiveSeconds(timeout);
        sessionConfig.getEvictionConfig().setEvictionPolicy(EvictionPolicy.LRU);

        config.addMapConfig(sessionConfig);
    }
}

