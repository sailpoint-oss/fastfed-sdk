FROM jboss/keycloak

ENV KEYCLOAK_USER=admin
ENV KEYCLOAK_PASSWORD=admin
ENV DB_VENDOR=H2

ADD full-import.json /opt/jboss/keycloak/


EXPOSE 8080
ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]

#the adding of the admin user to the fastfed realm has to be done AFTER the import since the docker-entrypoint.sh
# runs the add-user-keycloak.sh before the import.  The fastfed realm won't exist yet.  The admin user will also be created in the master realm
# by the ENV variables set above and how they are used in the docker-entrypoint.sh
CMD ["-b", "0.0.0.0", "-Dkeycloak.migration.action=import", "-Dkeycloak.migration.provider=singleFile", "-Dkeycloak.migration.file=/opt/jboss/keycloak/full-import.json"]


