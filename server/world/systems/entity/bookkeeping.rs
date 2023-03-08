use specs::{Entities, Entity, Join, ReadStorage, System, WriteExpect};

use crate::{
    Bookkeeping, BookkeepingAction, ClientFilter, ETypeComp, EntityFlag, EntityOperation,
    EntityProtocol, IDComp, Message, MessageQueue, MessageType, MetadataComp,
};

pub struct EntitiesBookkeepingSystem;

impl<'a> System<'a> for EntitiesBookkeepingSystem {
    type SystemData = (
        Entities<'a>,
        ReadStorage<'a, IDComp>,
        ReadStorage<'a, ETypeComp>,
        ReadStorage<'a, MetadataComp>,
        ReadStorage<'a, EntityFlag>,
        WriteExpect<'a, MessageQueue>,
        WriteExpect<'a, Bookkeeping>,
    );

    fn run(&mut self, data: Self::SystemData) {
        let (entities, ids, etypes, metadatas, flags, mut queue, mut bookkeeping) = data;

        let mut updated_entities = Vec::new();
        for (entity, _) in (&entities, &flags).join() {
            updated_entities.push(entity);
        }

        let actions = bookkeeping.differentiate_entities(&updated_entities);

        let read_info_of_entity = |entity: &Entity| {
            let id = ids.get(entity.to_owned()).map(|id| id.0.to_string());

            let etype = etypes
                .get(entity.to_owned())
                .map(|etype| etype.0.to_string());

            let metadata = metadatas
                .get(entity.to_owned())
                .map(|metadata| metadata.to_string());

            if id.is_none() || etype.is_none() {
                return None;
            }

            Some((id.unwrap(), etype.unwrap(), metadata))
        };

        let entity_updates = actions
            .iter()
            .filter_map(|action| {
                if let Some((id, etype, metadata)) = match action {
                    BookkeepingAction::CreateEntity(entity) => read_info_of_entity(entity),
                    BookkeepingAction::RemoveEntity(entity) => read_info_of_entity(entity),
                    _ => None,
                } {
                    return Some(EntityProtocol {
                        id,
                        r#type: etype,
                        metadata,
                        operation: match action {
                            BookkeepingAction::CreateEntity(_) => EntityOperation::Create,
                            BookkeepingAction::RemoveEntity(_) => EntityOperation::Remove,
                            _ => EntityOperation::Update,
                        },
                    });
                }

                None
            })
            .collect::<Vec<_>>();

        if !entity_updates.is_empty() {
            queue.push((
                Message::new(&MessageType::Entity)
                    .entities(&entity_updates)
                    .build(),
                ClientFilter::All,
            ));
        }
    }
}