create table horarios_personalizados
(
    id             int auto_increment
        primary key,
    cliente_id     int                                                                not null,
    instructora_id int                                                                not null,
    clase_id       int                                                                not null,
    tipo           enum ('fecha_especifica', 'recurrente') default 'fecha_especifica' not null,
    fecha          date                                                               null comment 'Solo se llena si tipo = fecha_especifica',
    dia_semana     enum ('L', 'M', 'X', 'J', 'V', 'S', 'D')                           null comment 'Solo se llena si tipo = recurrente',
    hora_inicio    time                                                               not null,
    hora_fin       time                                                               not null,
    activo         tinyint(1)                              default 1                  not null,
    creado_en      timestamp                               default CURRENT_TIMESTAMP  not null,
    constraint fk_hp_clase
        foreign key (clase_id) references clases (id)
            on delete cascade,
    constraint fk_hp_cliente
        foreign key (cliente_id) references usuarios (id)
            on delete cascade,
    constraint fk_hp_instructora
        foreign key (instructora_id) references instructoras (id)
            on delete cascade
)
    collate = utf8mb4_general_ci;

create index idx_hp_busqueda
    on horarios_personalizados (cliente_id, activo, tipo, fecha, dia_semana);